import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PriceHistory, ItemDetails } from '../../../core/models/item.model';
import { PriceChartService, ItemChartData } from '../../../core/services/price-chart.service';

Chart.register(...registerables);

@Component({
  selector: 'app-multi-item-price-chart',
  standalone: false,
  templateUrl: './multi-item-price-chart.component.html',
  styleUrl: './multi-item-price-chart.component.css',
})
export class MultiItemPriceChartComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('priceChart', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() items: ItemDetails[] = [];

  private priceChart: Chart | null = null;
  private isViewInitialized = false;
  private isInitializing = false;
  private lastItemsHash: string = '';

  constructor(private priceChartService: PriceChartService) {}

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.items && this.items.length > 0) {
      this.initializeChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.isViewInitialized) {
      // Create a hash of items to detect actual changes
      const itemsHash = this.createItemsHash(this.items);
      
      // Only re-initialize if items have actually changed
      if (itemsHash !== this.lastItemsHash) {
        this.lastItemsHash = itemsHash;
        if (this.items && this.items.length > 0) {
          this.initializeChart();
        } else if (this.priceChart) {
          this.priceChart.destroy();
          this.priceChart = null;
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.priceChart) {
      this.priceChart.destroy();
      this.priceChart = null;
    }
  }

  private initializeChart(): void {
    // Prevent concurrent initializations
    if (this.isInitializing) {
      return;
    }

    if (!this.items || this.items.length === 0) {
      return;
    }

    // Filter items that have price history
    const itemsWithHistory = this.items.filter(
      item => item.priceHistory && item.priceHistory.length > 0
    );

    if (itemsWithHistory.length === 0) {
      if (this.priceChart) {
        this.priceChart.destroy();
        this.priceChart = null;
      }
      return;
    }

    this.isInitializing = true;

    // Use setTimeout to ensure this runs after change detection
    setTimeout(() => {
      try {
        if (this.priceChart) {
          this.priceChart.destroy();
          this.priceChart = null;
        }

        if (!this.chartCanvas) {
          this.isInitializing = false;
          return;
        }

        const canvas = this.chartCanvas.nativeElement;
        if (!canvas || !canvas.parentElement) {
          this.isInitializing = false;
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.isInitializing = false;
          return;
        }

        // Prepare chart data for each item
        const itemsData: Array<{ chartData: ItemChartData; name: string; color: string }> = [];
        
        itemsWithHistory.forEach((item, index) => {
          try {
            const chartData = this.priceChartService.prepareChartData(item.priceHistory);
            const color = this.priceChartService.getItemColor(index);
            itemsData.push({
              chartData,
              name: this.truncateItemName(item.name),
              color,
            });
          } catch (error) {
            console.error(`Error preparing chart data for item ${item.name}:`, error);
          }
        });

        if (itemsData.length === 0) {
          this.isInitializing = false;
          return;
        }

        // Detect if mobile device
        const isMobile = window.innerWidth <= 640;
        
        // Use service to create multi-item chart configuration
        const chartConfig = this.priceChartService.createMultiItemChartConfig(itemsData, isMobile);
        this.priceChart = new Chart(ctx, chartConfig);
      } catch (error) {
        console.error('Error creating multi-item chart:', error);
        if (this.priceChart) {
          this.priceChart.destroy();
          this.priceChart = null;
        }
      } finally {
        this.isInitializing = false;
      }
    }, 0);
  }

  private createItemsHash(items: ItemDetails[]): string {
    if (!items || items.length === 0) {
      return '';
    }
    // Create a simple hash based on item URLs (more reliable than ID) and price history lengths
    // This helps detect when items have actually changed
    return items
      .map(item => `${item.url || item.id || ''}-${item.priceHistory?.length || 0}`)
      .join('|');
  }

  hasValidData(): boolean {
    return (
      this.items &&
      this.items.length > 0 &&
      this.items.some(item => item.priceHistory && item.priceHistory.length > 0)
    );
  }

  /**
   * Truncates item name if it's too long to prevent wrapping in chart legend
   */
  private truncateItemName(name: string, maxLength: number = 50): string {
    if (!name || name.length <= maxLength) {
      return name;
    }
    return name.substring(0, maxLength) + '...';
  }
}


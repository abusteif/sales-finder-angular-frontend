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
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { PriceHistory } from '../../../core/models/item.model';
import { SpecialNameTitlecasePipe } from '../../../shared/special-name-titlecase.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-price-chart',
  standalone: false,
  templateUrl: './price-chart.component.html',
  styleUrl: './price-chart.component.css',
})
export class PriceChartComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('priceChart', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() priceHistory: PriceHistory[] = [];
  @Input() store: string = '';

  private priceChart: Chart | null = null;
  private isViewInitialized = false;

  constructor(private specialNameTitlecasePipe: SpecialNameTitlecasePipe) {}

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.priceHistory && this.priceHistory.length > 0) {
      this.initializeChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['priceHistory'] && this.isViewInitialized) {
      if (this.priceHistory && this.priceHistory.length > 0) {
        this.initializeChart();
      } else if (this.priceChart) {
        this.priceChart.destroy();
        this.priceChart = null;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.priceChart) {
      this.priceChart.destroy();
    }
  }

  private initializeChart(): void {
    if (!this.priceHistory || this.priceHistory.length === 0) {
      return;
    }

    if (this.priceChart) {
      this.priceChart.destroy();
    }

    if (!this.chartCanvas) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Sort price history by date
    const sortedHistory = [...this.priceHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Create data points with x (date) and y (discountedPrice) coordinates
    // If discount is 0, use the fullPrice from the previous point

    const dataPoints = sortedHistory.map((item, index) => {
      let price = item.discountedPrice;
      // If discount is 0 (or very close to 0), use the fullPrice from the previous point
      const discount =
        typeof item.discount === 'string'
          ? parseFloat(item.discount)
          : item.discount;
      if ((discount === 0 || Math.abs(discount) < 0.01) && index > 0) {
        const previousItem = sortedHistory[index - 1];
        if (
          previousItem &&
          previousItem.fullPrice !== undefined &&
          previousItem.fullPrice !== null
        ) {
          price = previousItem.fullPrice;
        }
      }
      return {
        x: new Date(item.date).getTime(),
        y: price,
      };
    });

    // Check if all dates are in the same year
    const years = sortedHistory.map((item) =>
      new Date(item.date).getFullYear()
    );
    const uniqueYears = [...new Set(years)];
    const allSameYear = uniqueYears.length === 1;

    // Calculate min and max values from data points for y-axis scaling
    const prices = dataPoints
      .map((point) => point.y)
      .filter((price) => price !== null && price !== undefined);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    // For single data point or zero range, use a percentage of the price as padding
    const padding = priceRange > 0 ? priceRange * 0.1 : Math.max(minPrice * 0.1, 10);

    // Find the index of the lowest price point
    const lowestPriceIndex = dataPoints.findIndex(
      (point) => point.y === minPrice
    );

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        datasets: [
          {
            label: 'Price ($)',
            data: dataPoints,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0,
            stepped: 'before',
            fill: true,
            pointRadius: (ctx: any) => {
              return ctx.dataIndex === lowestPriceIndex ? 5 : 3;
            },
            pointHoverRadius: (ctx: any) => {
              return ctx.dataIndex === lowestPriceIndex ? 7 : 5;
            },
            pointBackgroundColor: (ctx: any) => {
              return ctx.dataIndex === lowestPriceIndex
                ? 'rgb(34, 197, 94)'
                : 'rgb(75, 192, 192)';
            },
            pointBorderColor: (ctx: any) => {
              return ctx.dataIndex === lowestPriceIndex ? '#fff' : '#fff';
            },
            pointBorderWidth: (ctx: any) => {
              return ctx.dataIndex === lowestPriceIndex ? 2 : 1.5;
            },
            segment: {
              borderDash: (ctx: any) => {
                const currentIndex = ctx.p1DataIndex;
                const currentDiscount = sortedHistory[currentIndex]?.discount;
                if (currentDiscount === 0) {
                  return [5, 5];
                }
                return [];
              },
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.store
              ? `Price History - ${this.specialNameTitlecasePipe.transform(this.store)}`
              : 'Price History Over Time',
            font: {
              size: 14,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function (context) {
                const timestamp = context[0].parsed.x;
                if (timestamp === null || timestamp === undefined) {
                  return 'Date: N/A';
                }
                const date = new Date(timestamp);
                if (allSameYear) {
                  return date.toLocaleDateString('en-AU', {
                    month: 'short',
                    day: 'numeric',
                  });
                }
                return date.toLocaleDateString('en-AU', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              },
              label: function (context) {
                const price = context.parsed.y;
                const isLowestPrice = context.dataIndex === lowestPriceIndex;
                let label = '';
                if (price === null || price === undefined) {
                  label = 'Price: N/A';
                } else if (price === 0) {
                  label = 'Price: $0';
                } else {
                  label = `Price: $${Math.round(price)}`;
                }
                if (isLowestPrice) {
                  label += ' (Lowest Price)';
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: minPrice - padding,
            suggestedMax: maxPrice + padding,
            title: {
              display: false,
            },
            ticks: {
              callback: function (value) {
                const numValue =
                  typeof value === 'string' ? parseFloat(value) : value;
                if (isNaN(numValue)) {
                  return '$0';
                }
                return '$' + Math.round(numValue);
              },
            },
          },
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Date',
            },
            min: sortedHistory.length === 1 
              ? new Date(sortedHistory[0].date).getTime() - 86400000 // 1 day before
              : undefined,
            max: sortedHistory.length === 1 
              ? new Date(sortedHistory[0].date).getTime() + 86400000 // 1 day after
              : undefined,
            ticks: {
              callback: function (value) {
                const date = new Date(value);
                if (allSameYear) {
                  return date.toLocaleDateString('en-AU', {
                    month: 'short',
                    day: 'numeric',
                  });
                }
                return date.toLocaleDateString('en-AU', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              },
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    };

    this.priceChart = new Chart(ctx, chartConfig);
  }
}

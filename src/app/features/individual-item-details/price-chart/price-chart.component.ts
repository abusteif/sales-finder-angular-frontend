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
import { PriceHistory } from '../../../core/models/item.model';
import { SpecialNameTitlecasePipe } from '../../../shared/special-name-titlecase.pipe';
import { PriceChartService, ChartDataPoint } from '../../../core/services/price-chart.service';

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
  isZoomedIn = false;
  private originalXMin: number | undefined = undefined;
  private originalXMax: number | undefined = undefined;
  private currentDataPoints: ChartDataPoint[] = [];
  private zoomCenterDate: number = 0; // Timestamp of the center point when zoomed in
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;
  private isSwiping: boolean = false;
  private tooltipTimeout: any = null;
  private shouldShowTooltip: boolean = false;
  // Store bound event handlers for proper cleanup
  private boundTouchStart?: (e: TouchEvent) => void;
  private boundTouchMove?: (e: TouchEvent) => void;
  private boundTouchEnd?: (e: TouchEvent) => void;
  private boundMouseDown?: (e: MouseEvent) => void;
  private boundMouseMove?: (e: MouseEvent) => void;
  private boundMouseUp?: (e: MouseEvent) => void;
  private boundMouseLeave?: (e: MouseEvent) => void;
  private boundDocumentClick?: (e: MouseEvent) => void;
  private boundDoubleClick?: (e: MouseEvent) => void;

  constructor(
    private specialNameTitlecasePipe: SpecialNameTitlecasePipe,
    private priceChartService: PriceChartService
  ) {}

  get canZoom(): boolean {
    return this.priceHistory && this.priceHistory.length > 1;
  }

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
    // Clear tooltip timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }
    this.removeDocumentClickListener();
    this.removeSwipeListeners();
    if (this.priceChart) {
      this.priceChart.destroy();
    }
  }

  private removeSwipeListeners(): void {
    if (!this.chartCanvas || !this.boundTouchStart) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;

    // Remove touch event listeners
    if (this.boundTouchStart) {
      canvas.removeEventListener('touchstart', this.boundTouchStart);
    }
    if (this.boundTouchMove) {
      canvas.removeEventListener('touchmove', this.boundTouchMove);
    }
    if (this.boundTouchEnd) {
      canvas.removeEventListener('touchend', this.boundTouchEnd);
    }

    // Remove mouse event listeners
    if (this.boundMouseDown) {
      canvas.removeEventListener('mousedown', this.boundMouseDown);
    }
    if (this.boundMouseMove) {
      canvas.removeEventListener('mousemove', this.boundMouseMove);
    }
    if (this.boundMouseUp) {
      canvas.removeEventListener('mouseup', this.boundMouseUp);
    }
    if (this.boundMouseLeave) {
      canvas.removeEventListener('mouseleave', this.boundMouseLeave);
    }
    if (this.boundDoubleClick) {
      canvas.removeEventListener('dblclick', this.boundDoubleClick);
    }
  }

  private removeDocumentClickListener(): void {
    if (this.boundDocumentClick) {
      document.removeEventListener('click', this.boundDocumentClick, true);
      this.boundDocumentClick = undefined;
    }
  }

  private initializeChart(): void {
    if (!this.priceHistory || this.priceHistory.length === 0) {
      return;
    }

    // Remove old event listeners before destroying chart
    this.removeDocumentClickListener();
    this.removeSwipeListeners();

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

    // Use service to prepare chart data
    const chartData = this.priceChartService.prepareChartData(this.priceHistory);
    this.currentDataPoints = chartData.dataPoints;

    // Use service to create chart configuration
    const chartConfig = this.priceChartService.createSingleItemChartConfig(chartData);

    // Override tooltip filter to use component's shouldShowTooltip flag
    if (chartConfig.options?.plugins?.tooltip) {
      const originalFilter = chartConfig.options.plugins.tooltip.filter;
      chartConfig.options.plugins.tooltip.filter = (tooltipItem) => {
        const rawPoint = tooltipItem.raw as ChartDataPoint | undefined;
        return this.shouldShowTooltip && !(rawPoint?.isHelper);
      };
    }

    // Add event handlers
    chartConfig.options = chartConfig.options || {};
    // @ts-ignore - onHover is a valid Chart.js option but not in TypeScript definitions
    chartConfig.options.onHover = (event: any, elements: any[]) => {
      this.handleChartHover(event, elements);
    };
    chartConfig.options.onClick = (event, elements) => {
      this.handleChartClick(event, elements);
    };

    // Store original x-axis min/max values for zoom functionality
    const xScaleConfig = chartConfig.options?.scales?.['x'];
    if (xScaleConfig) {
      const minValue = xScaleConfig.min;
      const maxValue = xScaleConfig.max;
      this.originalXMin = typeof minValue === 'number' ? minValue : undefined;
      this.originalXMax = typeof maxValue === 'number' ? maxValue : undefined;
    }
    this.isZoomedIn = false;

    this.priceChart = new Chart(ctx, chartConfig);
    
    // Attach swipe event listeners to the canvas
    this.attachSwipeListeners();
    
    // Attach document click listener to hide tooltip when clicking outside
    this.attachDocumentClickListener();
  }

  private attachSwipeListeners(): void {
    if (!this.chartCanvas) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;

    // Store arrow function references for event handlers
    this.boundTouchStart = (e: TouchEvent) => this.onCanvasTouchStart(e);
    this.boundTouchMove = (e: TouchEvent) => this.onCanvasTouchMove(e);
    this.boundTouchEnd = (e: TouchEvent) => this.onCanvasTouchEnd(e);
    this.boundMouseDown = (e: MouseEvent) => this.onCanvasMouseDown(e);
    this.boundMouseMove = (e: MouseEvent) => this.onCanvasMouseMove(e);
    this.boundMouseUp = (e: MouseEvent) => this.onCanvasMouseUp(e);
    this.boundMouseLeave = (e: MouseEvent) => this.onCanvasMouseLeave(e);

    // Touch events
    canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false });

    // Mouse events
    canvas.addEventListener('mousedown', this.boundMouseDown);
    canvas.addEventListener('mousemove', this.boundMouseMove);
    canvas.addEventListener('mouseup', this.boundMouseUp);
    canvas.addEventListener('mouseleave', this.boundMouseLeave);
    
    // Double-click event for zoom
    this.boundDoubleClick = (e: MouseEvent) => this.onCanvasDoubleClick(e);
    canvas.addEventListener('dblclick', this.boundDoubleClick);
  }

  private attachDocumentClickListener(): void {
    // Store arrow function reference for document click handler
    this.boundDocumentClick = (e: MouseEvent) => this.onDocumentClick(e);
    // Use capture phase to catch clicks before they bubble
    document.addEventListener('click', this.boundDocumentClick, true);
  }

  private hideTooltip(): void {
    if (!this.priceChart) {
      return;
    }
    
    // Clear any existing tooltip timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }

    // Hide tooltip
    this.shouldShowTooltip = false;
    const tooltip = this.priceChart.tooltip;
    if (tooltip) {
      tooltip.setActiveElements([], { x: 0, y: 0 });
      this.priceChart.update('none');
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    if (!this.priceChart || !this.chartCanvas) {
      return;
    }

    // Check if the click was inside the chart canvas
    const canvas = this.chartCanvas.nativeElement;
    const clickedInsideChart = canvas.contains(event.target as Node);

    // If clicked outside the chart, hide the tooltip immediately
    if (!clickedInsideChart) {
      this.hideTooltip();
    }
  }

  private onCanvasTouchStart(event: TouchEvent): void {
    if (!this.isZoomedIn) {
      return;
    }
    const touch = event.touches[0];
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
    this.isSwiping = true;
    
    // Hide tooltip when swipe starts
    this.hideTooltip();
  }

  private onCanvasTouchMove(event: TouchEvent): void {
    if (!this.isSwiping || !this.isZoomedIn) {
      return;
    }
    event.preventDefault(); // Prevent scrolling while swiping
  }

  private onCanvasTouchEnd(event: TouchEvent): void {
    if (!this.isSwiping || !this.isZoomedIn) {
      return;
    }
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.swipeStartX;
    const deltaY = touch.clientY - this.swipeStartY;
    
    // Only process if horizontal movement is greater than vertical (swipe left/right)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      this.handleSwipe(deltaX > 0 ? 'right' : 'left');
      // Hide tooltip after swipe completes
      this.hideTooltip();
    }
    
    this.isSwiping = false;
  }

  private onCanvasMouseDown(event: MouseEvent): void {
    if (!this.isZoomedIn) {
      return;
    }
    this.swipeStartX = event.clientX;
    this.swipeStartY = event.clientY;
    this.isSwiping = true;
    
    // Hide tooltip when swipe starts
    this.hideTooltip();
  }

  private onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isSwiping || !this.isZoomedIn) {
      return;
    }
    // Text selection is prevented via CSS user-select: none when zoomed in
  }

  private onCanvasMouseUp(event: MouseEvent): void {
    if (!this.isSwiping || !this.isZoomedIn) {
      return;
    }
    
    const deltaX = event.clientX - this.swipeStartX;
    const deltaY = event.clientY - this.swipeStartY;
    
    // Only process if horizontal movement is greater than vertical (swipe left/right)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      this.handleSwipe(deltaX > 0 ? 'right' : 'left');
      // Hide tooltip after swipe completes
      this.hideTooltip();
    }
    
    this.isSwiping = false;
  }

  private onCanvasMouseLeave(event: MouseEvent): void {
    this.isSwiping = false;
    // Hide tooltip when mouse leaves the chart
    this.hideTooltip();
    
    // Reset cursor when mouse leaves the chart
    if (this.chartCanvas) {
      const canvas = this.chartCanvas.nativeElement;
      if (this.isZoomedIn) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }

  private onCanvasDoubleClick(event: MouseEvent): void {
    if (!this.priceChart || !this.chartCanvas) {
      return;
    }

    // Don't allow zoom if there's only 1 history item
    if (!this.canZoom) {
      return;
    }

    // Prevent default double-click behavior (text selection)
    event.preventDefault();

    // If already zoomed in, zoom out
    if (this.isZoomedIn) {
      this.zoomOut();
      return;
    }

    // Get the clicked point from the chart
    const canvas = this.chartCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Use Chart.js to get the elements at the click position
    const elements = this.priceChart.getElementsAtEventForMode(
      event as any,
      'nearest',
      { intersect: true },
      true
    );

    // If we clicked on a point, zoom in centered on that point
    if (elements.length > 0) {
      const element = elements[0];
      const dataIndex = element.index;
      const clickedPoint = this.currentDataPoints[dataIndex];
      
      if (clickedPoint) {
        this.zoomIn(clickedPoint.x);
      }
    } else {
      // If clicking on empty space, zoom in centered on the click position
      const scales = this.priceChart.scales;
      const xScale = scales ? scales['x'] : null;
      if (xScale) {
        const value = xScale.getValueForPixel(x);
        if (value !== null && value !== undefined) {
          this.zoomIn(value);
        }
      }
    }
  }

  zoomIn(centerDate?: number): void {
    if (!this.priceChart || this.currentDataPoints.length === 0) {
      return;
    }

    // Don't allow zoom if there's only 1 history item
    if (!this.canZoom) {
      return;
    }

    const xScale = this.priceChart.options.scales?.['x'];
    if (!xScale) {
      return;
    }

    // Use provided center date, or find the center of the current view, or use the middle data point
    let zoomCenterDate: number;
    if (centerDate !== undefined) {
      zoomCenterDate = centerDate;
    } else if (this.isZoomedIn && typeof xScale.min === 'number' && typeof xScale.max === 'number') {
      // Use the center of the current view
      zoomCenterDate = (xScale.min + xScale.max) / 2;
    } else {
      // Use the middle data point as the initial zoom center
      const middleIndex = Math.floor(this.currentDataPoints.length / 2);
      zoomCenterDate = this.currentDataPoints[middleIndex]['x'];
    }

    const centerDateObj = new Date(zoomCenterDate);
    const tenDaysBefore = new Date(centerDateObj);
    tenDaysBefore.setDate(centerDateObj.getDate() - 10);
    const tenDaysAfter = new Date(centerDateObj);
    tenDaysAfter.setDate(centerDateObj.getDate() + 10);

    // Ensure we don't zoom beyond the data bounds
    const dataMin = Math.min(...this.currentDataPoints.map(p => p['x']));
    const dataMax = Math.max(...this.currentDataPoints.map(p => p['x']));
    
    const minTime = Math.max(tenDaysBefore.getTime(), dataMin);
    const maxTime = Math.min(tenDaysAfter.getTime(), dataMax);

    this.isZoomedIn = true;
    this.zoomCenterDate = zoomCenterDate;
    xScale.min = minTime;
    xScale.max = maxTime;
    this.priceChart.update();
  }

  zoomOut(): void {
    if (!this.priceChart) {
      return;
    }

    const xScale = this.priceChart.options.scales?.['x'];
    if (!xScale) {
      return;
    }

    this.isZoomedIn = false;
    this.zoomCenterDate = 0;
    xScale.min = this.originalXMin;
    xScale.max = this.originalXMax;
    this.priceChart.update();
  }

  private handleChartHover(event: any, elements: any[]): void {
    if (!this.priceChart || !this.chartCanvas) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;

    // Don't show tooltip while swiping
    if (this.isSwiping) {
      this.shouldShowTooltip = false;
      const tooltip = this.priceChart.tooltip;
      if (tooltip) {
        tooltip.setActiveElements([], { x: 0, y: 0 });
        this.priceChart.update('none');
      }
      // Reset cursor when swiping
      if (this.isZoomedIn) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
      return;
    }

    const tooltip = this.priceChart.tooltip;
    if (!tooltip) {
      return;
    }

    // Only show tooltip if we're actually over an element
    if (elements && elements.length > 0) {
      this.shouldShowTooltip = true;
      const element = elements[0];
      const rect = canvas.getBoundingClientRect();
      
      // Change cursor to pointer when hovering over a dot
      canvas.style.cursor = 'pointer';
      
      // Get mouse position relative to canvas
      const nativeEvent = event.native || event;
      const x = nativeEvent.offsetX !== undefined 
        ? nativeEvent.offsetX 
        : nativeEvent.clientX - rect.left;
      const y = nativeEvent.offsetY !== undefined 
        ? nativeEvent.offsetY 
        : nativeEvent.clientY - rect.top;
      
      const canvasPosition = { x, y };
      
      // Show tooltip for the hovered point
      tooltip.setActiveElements(
        [
          {
            datasetIndex: element.datasetIndex,
            index: element.index,
          },
        ],
        canvasPosition
      );
      this.priceChart.update('none');
    } else {
      // Explicitly hide tooltip when not over any element
      this.shouldShowTooltip = false;
      tooltip.setActiveElements([], { x: 0, y: 0 });
      this.priceChart.update('none');
      
      // Reset cursor when not hovering over a dot
      if (this.isZoomedIn) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }

  private handleChartClick(event: any, elements: any[]): void {
    if (!this.priceChart || !this.chartCanvas) {
      return;
    }

    // Clear any existing tooltip timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }

    // If clicking on empty space, hide tooltip
    if (elements.length === 0) {
      this.shouldShowTooltip = false;
      const tooltip = this.priceChart.tooltip;
      if (tooltip) {
        tooltip.setActiveElements([], { x: 0, y: 0 });
        this.priceChart.update('none');
      }
      return;
    }

    // Show tooltip for the clicked point
    this.shouldShowTooltip = true;
    const element = elements[0];
    const canvas = this.chartCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const nativeEvent = event.native || event;
    const x = nativeEvent.offsetX !== undefined 
      ? nativeEvent.offsetX 
      : nativeEvent.clientX - rect.left;
    const y = nativeEvent.offsetY !== undefined 
      ? nativeEvent.offsetY 
      : nativeEvent.clientY - rect.top;
    
    const canvasPosition = { x, y };
    
    const tooltip = this.priceChart.tooltip;
    if (tooltip) {
      // Set active elements to show tooltip
      tooltip.setActiveElements(
        [
          {
            datasetIndex: element.datasetIndex,
            index: element.index,
          },
        ],
        canvasPosition
      );
      this.priceChart.update('none');

      // Hide tooltip after 2 seconds
      this.tooltipTimeout = setTimeout(() => {
        if (this.priceChart && this.priceChart.tooltip) {
          this.shouldShowTooltip = false;
          this.priceChart.tooltip.setActiveElements([], { x: 0, y: 0 });
          this.priceChart.update('none');
        }
        this.tooltipTimeout = null;
      }, 2000);
    }
  }

  private handleSwipe(direction: 'left' | 'right'): void {
    if (!this.priceChart || !this.isZoomedIn) {
      return;
    }

    const xScale = this.priceChart.options.scales?.['x'];
    if (!xScale || typeof xScale.min !== 'number' || typeof xScale.max !== 'number') {
      return;
    }

    const currentMin = xScale.min;
    const currentMax = xScale.max;
    const currentRange = currentMax - currentMin;
    const shiftAmount = currentRange * 0.5; // Shift by 50% of the current view

    let newMin: number;
    let newMax: number;

    if (direction === 'left') {
      // Swipe left = move view to the right (later dates)
      newMin = currentMin + shiftAmount;
      newMax = currentMax + shiftAmount;
    } else {
      // Swipe right = move view to the left (earlier dates)
      newMin = currentMin - shiftAmount;
      newMax = currentMax - shiftAmount;
    }

    // Ensure we don't go beyond the data bounds
    const dataMin = Math.min(...this.currentDataPoints.map(p => p['x']));
    const dataMax = Math.max(...this.currentDataPoints.map(p => p['x']));

    // If we've hit the bounds, don't shift
    if (newMin < dataMin || newMax > dataMax) {
      return;
    }

    xScale.min = newMin;
    xScale.max = newMax;
    this.zoomCenterDate = (newMin + newMax) / 2;
    
    // Hide tooltip before updating chart
    this.hideTooltip();
    this.priceChart.update();
  }
}

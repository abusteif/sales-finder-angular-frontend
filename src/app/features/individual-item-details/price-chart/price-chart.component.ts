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
  isZoomedIn = false;
  private originalXMin: number | undefined = undefined;
  private originalXMax: number | undefined = undefined;
  private currentDataPoints: { x: number; y: number }[] = [];
  private zoomCenterDate: number = 0; // Timestamp of the center point when zoomed in
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;
  private isSwiping: boolean = false;
  private tooltipTimeout: any = null;
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
            display: false,
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            animation: {
              duration: 0, // Disable animation for instant display
            },
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
          intersect: true, // Only interact when directly over a point
        },
        events: ['click'], // Only respond to click events to prevent hover tooltips
        onClick: (event, elements) => {
          this.handleChartClick(event, elements);
        },
      },
    };

    // Store data points and original x-axis min/max values
    this.currentDataPoints = dataPoints;
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

    // Bind event handlers and store references
    this.boundTouchStart = this.onCanvasTouchStart.bind(this);
    this.boundTouchMove = this.onCanvasTouchMove.bind(this);
    this.boundTouchEnd = this.onCanvasTouchEnd.bind(this);
    this.boundMouseDown = this.onCanvasMouseDown.bind(this);
    this.boundMouseMove = this.onCanvasMouseMove.bind(this);
    this.boundMouseUp = this.onCanvasMouseUp.bind(this);
    this.boundMouseLeave = this.onCanvasMouseLeave.bind(this);

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
    this.boundDoubleClick = this.onCanvasDoubleClick.bind(this);
    canvas.addEventListener('dblclick', this.boundDoubleClick);
  }

  private attachDocumentClickListener(): void {
    // Bind and store the document click handler
    this.boundDocumentClick = this.onDocumentClick.bind(this);
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
    // Prevent text selection while dragging
    event.preventDefault();
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
  }

  private onCanvasDoubleClick(event: MouseEvent): void {
    if (!this.priceChart || !this.chartCanvas) {
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
      const tooltip = this.priceChart.tooltip;
      if (tooltip) {
        tooltip.setActiveElements([], { x: 0, y: 0 });
        this.priceChart.update('none');
      }
      return;
    }

    // Show tooltip for the clicked point
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

      // Hide tooltip after 1 second
      this.tooltipTimeout = setTimeout(() => {
        if (this.priceChart && this.priceChart.tooltip) {
          this.priceChart.tooltip.setActiveElements([], { x: 0, y: 0 });
          this.priceChart.update('none');
        }
        this.tooltipTimeout = null;
      }, 1000);
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

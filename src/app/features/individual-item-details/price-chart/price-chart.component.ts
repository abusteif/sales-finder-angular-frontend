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

interface ChartDataPoint {
  x: number;
  y: number;
  originalIndex: number;
  discountValue: number;
  isHelper?: boolean;
}

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
    const normalizedDiscounts: number[] = [];

    const dataPoints = sortedHistory.map((item, index) => {
      let price = item.discountedPrice;
      // If discount is 0 (or very close to 0), use the fullPrice from the previous point
      let discount =
        typeof item.discount === 'string'
          ? parseFloat(item.discount)
          : item.discount;
      if (isNaN(discount as number)) {
        discount = 0;
      }
      normalizedDiscounts.push(discount);
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

    // Build stepped data points so we can style horizontal and vertical segments separately
    const chartDataPoints: ChartDataPoint[] = [];
    dataPoints.forEach((point, index) => {
      const discountValue = normalizedDiscounts[index] ?? 0;
      const actualPoint: ChartDataPoint = {
        x: point.x,
        y: point.y,
        originalIndex: index,
        discountValue,
      };
      chartDataPoints.push(actualPoint);

      // Insert helper point to maintain stepped appearance without relying on stepped mode
      if (index < dataPoints.length - 1) {
        chartDataPoints.push({
          x: dataPoints[index + 1].x,
          y: point.y,
          originalIndex: index,
          discountValue,
          isHelper: true,
        });
      }
    });

    const chartLowestPriceIndex = chartDataPoints.findIndex(
      (point) => !point.isHelper && point.y === minPrice
    );
    const highlightedLowestIndex =
      chartLowestPriceIndex !== -1 ? chartLowestPriceIndex : 0;

    // Calculate date range for x-axis padding
    const dateRange = dataPoints.length > 1
      ? dataPoints[dataPoints.length - 1].x - dataPoints[0].x
      : 0;
    const xAxisPadding = dateRange > 0 ? dateRange * 0.008 : 0; // ~2px padding on each side

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        datasets: [
          {
            label: 'Price ($)',
            data: chartDataPoints,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0,
            stepped: false,
            fill: true,
            pointRadius: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              if (rawPoint?.isHelper) {
                return 0;
              }
              return ctx.dataIndex === highlightedLowestIndex ? 5 : 3;
            },
            pointHoverRadius: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              if (rawPoint?.isHelper) {
                return 0;
              }
              return ctx.dataIndex === highlightedLowestIndex ? 7 : 5;
            },
            pointBackgroundColor: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              if (rawPoint?.isHelper) {
                return 'rgba(0,0,0,0)';
              }
              return ctx.dataIndex === highlightedLowestIndex
                ? 'rgb(34, 197, 94)'
                : 'rgb(75, 192, 192)';
            },
            pointBorderColor: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              if (rawPoint?.isHelper) {
                return 'rgba(0,0,0,0)';
              }
              return '#fff';
            },
            pointBorderWidth: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              if (rawPoint?.isHelper) {
                return 0;
              }
              return ctx.dataIndex === highlightedLowestIndex ? 2 : 1.5;
            },
            pointHitRadius: (ctx: any) => {
              const rawPoint = ctx.raw as ChartDataPoint | undefined;
              return rawPoint?.isHelper ? 0 : 5;
            },
            segment: {
              borderDash: (ctx: any) => {
                // Using duplicated points to mimic stepped lines allows us to detect actual horizontal segments
                const p0 = ctx.p0?.parsed || ctx.p0;
                const p1 = ctx.p1?.parsed || ctx.p1;

                if (!p0 || !p1) {
                  return [];
                }

                // Check if this segment is horizontal (same y-value)
                // For stepped lines, horizontal segments maintain the same y value
                const isHorizontal = p0.y !== undefined && p1.y !== undefined &&
                                    Math.abs(p0.y - p1.y) < 0.01;

                // Only apply dotted style to horizontal segments
                if (!isHorizontal) {
                  return []; // Solid vertical line
                }

                const rawPoint = ctx.p0?.raw as ChartDataPoint | undefined;
                if (!rawPoint || rawPoint.isHelper) {
                  return [];
                }

                const discount = rawPoint.discountValue ?? 0;

                // Show dotted line only for horizontal segments when discount is 0
                if (discount === 0 || Math.abs(discount) < 0.01) {
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
            mode: 'point', // Only show when directly over a point
            intersect: true, // Only show when directly over a point
            animation: {
              duration: 0, // Disable animation for instant display
            },
            filter: (tooltipItem) => {
              const rawPoint = tooltipItem.raw as ChartDataPoint | undefined;
              // Only show tooltip when we explicitly want it and skip helper points
              return this.shouldShowTooltip && !(rawPoint?.isHelper);
            },
            callbacks: {
              title: function (context) {
                // Defensive check: ensure context array has elements and first element has parsed data
                if (!context || context.length === 0 || !context[0] || !context[0].parsed) {
                  return 'Date: N/A';
                }
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
                // Defensive check: ensure context has parsed data
                if (!context || !context.parsed) {
                  return 'Price: N/A';
                }
                const rawPoint = context.raw as ChartDataPoint | undefined;
                if (rawPoint?.isHelper) {
                  return '';
                }
                const price = context.parsed.y;
                const isLowestPrice = context.dataIndex === highlightedLowestIndex;
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
              : dataPoints[0].x - xAxisPadding, // Start slightly before first data point
            max: sortedHistory.length === 1 
              ? new Date(sortedHistory[0].date).getTime() + 86400000 // 1 day after
              : dataPoints[dataPoints.length - 1].x + xAxisPadding, // End slightly after last data point
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
          mode: 'point', // Only interact when directly over a point
          intersect: true, // Only interact when directly over a point
        },
        events: ['click', 'mousemove'], // Enable both click and hover events
        // @ts-ignore - onHover is a valid Chart.js option but not in TypeScript definitions
        onHover: (event: any, elements: any[]) => {
          this.handleChartHover(event, elements);
        },
        onClick: (event, elements) => {
          this.handleChartClick(event, elements);
        },
      },
    };

    // Store data points and original x-axis min/max values
    this.currentDataPoints = chartDataPoints;
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

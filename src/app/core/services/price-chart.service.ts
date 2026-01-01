import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { PriceHistory } from '../models/item.model';

export interface ChartDataPoint {
  x: number;
  y: number;
  originalIndex: number;
  discountValue: number;
  isHelper?: boolean;
}

export interface ItemChartData {
  dataPoints: ChartDataPoint[];
  sortedHistory: PriceHistory[];
  minPrice: number;
  maxPrice: number;
  allSameYear: boolean;
  highlightedLowestIndex: number;
}

export interface MultiItemChartConfig {
  items: Array<{
    priceHistory: PriceHistory[];
    name: string;
    color: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class PriceChartService {
  // Predefined colors for multiple items
  private readonly itemColors = [
    'rgb(75, 192, 192)',   // Teal
    'rgb(255, 99, 132)',   // Red
    'rgb(54, 162, 235)',   // Blue
    'rgb(255, 206, 86)',   // Yellow
    'rgb(153, 102, 255)',  // Purple
    'rgb(255, 159, 64)',   // Orange
    'rgb(199, 199, 199)',  // Grey
    'rgb(83, 102, 255)',   // Indigo
    'rgb(255, 99, 255)',   // Magenta
    'rgb(99, 255, 132)',   // Green
  ];

  /**
   * Prepares chart data from price history
   */
  prepareChartData(priceHistory: PriceHistory[]): ItemChartData {
    if (!priceHistory || priceHistory.length === 0) {
      throw new Error('Price history is required');
    }

    // Filter out invalid entries and sort price history by date
    const validHistory = priceHistory.filter(item => {
      if (!item.date) return false;
      const dateTime = new Date(item.date).getTime();
      if (isNaN(dateTime)) return false;
      if (item.discountedPrice === null || item.discountedPrice === undefined) return false;
      return true;
    });

    if (validHistory.length === 0) {
      throw new Error('No valid price history entries found');
    }

    const sortedHistory = [...validHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Create data points with x (date) and y (discountedPrice) coordinates
    const normalizedDiscounts: number[] = [];

    const dataPoints = sortedHistory.map((item, index) => {
      let price = item.discountedPrice;
      // Handle discount: convert string to number, or keep as number, or null
      let discount: number | null =
        typeof item.discount === 'string'
          ? parseFloat(item.discount)
          : item.discount;
      
      // If discount is null or NaN, set to null (don't treat as 0)
      if (discount === null || (typeof discount === 'number' && isNaN(discount))) {
        discount = null;
      }
      
      normalizedDiscounts.push(discount ?? 0);
      
      if (index > 0 && (item.discountedPrice === 0 || (discount !== null && (discount === 0 || Math.abs(discount) < 0.01)))) {
        const previousItem = sortedHistory[index - 1];
        if (
          previousItem &&
          previousItem.fullPrice !== undefined &&
          previousItem.fullPrice !== null &&
          previousItem.fullPrice > 0
        ) {
          price = previousItem.discountedPrice;
        }
      }
      
      // Normalize date to midnight for consistent year-based ordering
      const normalizedDate = new Date(item.date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      return {
        x: normalizedDate.getTime(),
        y: price,
      };
    });

    // Add today's date point with the same value as the last point
    if (dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      const lastPointDate = new Date(lastPoint.x);
      lastPointDate.setHours(0, 0, 0, 0);
      if (lastPointDate.getTime() !== todayTimestamp) {
        dataPoints.push({
          x: todayTimestamp,
          y: lastPoint.y,
        });
        normalizedDiscounts.push(normalizedDiscounts[normalizedDiscounts.length - 1] ?? 0);
      }
    }

    // Check if all dates are in the same year (using normalized dates)
    const years = sortedHistory.map((item) => {
      const normalizedDate = new Date(item.date);
      normalizedDate.setHours(0, 0, 0, 0);
      return normalizedDate.getFullYear();
    });
    const uniqueYears = [...new Set(years)];
    const allSameYear = uniqueYears.length === 1;

    // Calculate min and max values from data points for y-axis scaling
    // Exclude zero prices from min/max calculation (but keep them in the chart)
    const prices = dataPoints
      .map((point) => point.y)
      .filter((price) => price !== null && price !== undefined && price > 0);
    
    if (prices.length === 0) {
      throw new Error('No valid non-zero price entries found');
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

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

    return {
      dataPoints: chartDataPoints,
      sortedHistory,
      minPrice,
      maxPrice,
      allSameYear,
      highlightedLowestIndex,
    };
  }

  /**
   * Creates a single-item chart configuration
   */
  createSingleItemChartConfig(
    chartData: ItemChartData,
    borderColor: string = 'rgb(75, 192, 192)',
    backgroundColor: string = 'rgba(75, 192, 192, 0.2)'
  ): ChartConfiguration {
    const { dataPoints, sortedHistory, minPrice, maxPrice, allSameYear, highlightedLowestIndex } = chartData;
    const priceRange = maxPrice - minPrice;
    const padding = priceRange > 0 ? priceRange * 0.1 : Math.max(minPrice * 0.1, 10);

    // Calculate date range for x-axis padding
    const firstPoint = dataPoints.find(p => !p.isHelper);
    const lastPoint = [...dataPoints].reverse().find(p => !p.isHelper);
    const dateRange = firstPoint && lastPoint && firstPoint !== lastPoint
      ? lastPoint.x - firstPoint.x
      : 0;
    const xAxisPadding = dateRange > 0 ? dateRange * 0.008 : 0;

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        datasets: [
          {
            label: 'Price ($)',
            data: dataPoints,
            borderColor,
            backgroundColor,
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
                : borderColor;
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
                const p0 = ctx.p0?.parsed || ctx.p0;
                const p1 = ctx.p1?.parsed || ctx.p1;

                if (!p0 || !p1) {
                  return [];
                }

                const isHorizontal = p0.y !== undefined && p1.y !== undefined &&
                                    Math.abs(p0.y - p1.y) < 0.01;

                if (!isHorizontal) {
                  return [];
                }

                const rawPoint = ctx.p0?.raw as ChartDataPoint | undefined;
                if (!rawPoint || rawPoint.isHelper) {
                  return [];
                }

                const discount = rawPoint.discountValue ?? 0;

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
            mode: 'point',
            intersect: true,
            animation: {
              duration: 0,
            },
            callbacks: {
              title: (context) => {
                if (!context || context.length === 0 || !context[0] || !context[0].parsed) {
                  return 'Date: N/A';
                }
                const timestamp = context[0].parsed.x;
                if (timestamp === null || timestamp === undefined) {
                  return 'Date: N/A';
                }
                return this.formatDate(timestamp, allSameYear);
              },
              label: (context) => {
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
                if (isLowestPrice && sortedHistory.length > 1) {
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
            suggestedMin: Math.max(0, minPrice - padding),
            suggestedMax: maxPrice + padding,
            title: {
              display: false,
            },
            ticks: {
              callback: (value) => {
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
              ? new Date(sortedHistory[0].date).getTime() - 86400000
              : (firstPoint?.x ?? 0) - xAxisPadding,
            max: sortedHistory.length === 1 
              ? new Date(sortedHistory[0].date).getTime() + 86400000
              : (lastPoint?.x ?? 0) + xAxisPadding,
            ticks: {
              callback: (value) => {
                const date = new Date(value);
                return this.formatDate(date.getTime(), allSameYear);
              },
            },
          },
        },
        interaction: {
          mode: 'point',
          intersect: true,
        },
        events: ['click', 'mousemove'],
      },
    };

    return chartConfig;
  }

  /**
   * Creates a multi-item chart configuration
   */
  createMultiItemChartConfig(
    itemsData: Array<{ chartData: ItemChartData; name: string; color: string }>,
    isMobile: boolean = false
  ): ChartConfiguration {
    if (itemsData.length === 0) {
      throw new Error('At least one item is required');
    }

    // Calculate global min/max across all items
    const allMinPrices = itemsData.map(item => item.chartData.minPrice);
    const allMaxPrices = itemsData.map(item => item.chartData.maxPrice);
    const globalMinPrice = Math.min(...allMinPrices);
    const globalMaxPrice = Math.max(...allMaxPrices);
    const priceRange = globalMaxPrice - globalMinPrice;
    const padding = priceRange > 0 ? priceRange * 0.1 : Math.max(globalMinPrice * 0.1, 10);

    // Calculate global date range
    const allDates: number[] = [];
    itemsData.forEach(item => {
      item.chartData.dataPoints.forEach(point => {
        if (!point.isHelper) {
          allDates.push(point.x);
        }
      });
    });
    
    // Handle case where no valid dates are found
    if (allDates.length === 0) {
      throw new Error('No valid date points found in chart data');
    }
    
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);
    const dateRange = maxDate - minDate;
    const xAxisPadding = dateRange > 0 ? dateRange * 0.008 : 0;

    // Check if all dates are in the same year across all items
    const years = allDates.map(date => new Date(date).getFullYear());
    const uniqueYears = [...new Set(years)];
    const allSameYear = uniqueYears.length === 1;

    // Create datasets for each item
    const datasets = itemsData.map((item, index) => {
      const { chartData, name, color } = item;
      const rgbaColor = this.rgbToRgba(color, 0.2);

      return {
        label: name,
        data: chartData.dataPoints,
        borderColor: color,
        backgroundColor: rgbaColor,
        borderWidth: 2,
        tension: 0,
        stepped: false,
        fill: true,
        pointRadius: (ctx: any) => {
          const rawPoint = ctx.raw as ChartDataPoint | undefined;
          if (rawPoint?.isHelper) {
            return 0;
          }
          return 3;
        },
        pointHoverRadius: (ctx: any) => {
          const rawPoint = ctx.raw as ChartDataPoint | undefined;
          if (rawPoint?.isHelper) {
            return 0;
          }
          return 5;
        },
        pointBackgroundColor: (ctx: any) => {
          const rawPoint = ctx.raw as ChartDataPoint | undefined;
          if (rawPoint?.isHelper) {
            return 'rgba(0,0,0,0)';
          }
          return color;
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
          return 1.5;
        },
        pointHitRadius: (ctx: any) => {
          const rawPoint = ctx.raw as ChartDataPoint | undefined;
          return rawPoint?.isHelper ? 0 : 5;
        },
        segment: {
          borderDash: (ctx: any) => {
            const p0 = ctx.p0?.parsed || ctx.p0;
            const p1 = ctx.p1?.parsed || ctx.p1;

            if (!p0 || !p1) {
              return [];
            }

            const isHorizontal = p0.y !== undefined && p1.y !== undefined &&
                                Math.abs(p0.y - p1.y) < 0.01;

            if (!isHorizontal) {
              return [];
            }

            const rawPoint = ctx.p0?.raw as ChartDataPoint | undefined;
            if (!rawPoint || rawPoint.isHelper) {
              return [];
            }

            const discount = rawPoint.discountValue ?? 0;

            if (discount === 0 || Math.abs(discount) < 0.01) {
              return [5, 5];
            }
            return [];
          },
        },
      };
    });

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: isMobile ? 5 : 15,
              font: {
                size: isMobile ? 11 : 12,
              },
              boxWidth: isMobile ? 12 : 12,
              boxHeight: isMobile ? 12 : 12,
            },
            align: isMobile ? 'start' : 'center',
          },
          tooltip: {
            enabled: true,
            mode: 'point',
            intersect: true,
            animation: {
              duration: 0,
            },
            filter: (tooltipItem) => {
              const rawPoint = tooltipItem.raw as ChartDataPoint | undefined;
              return !(rawPoint?.isHelper);
            },
            callbacks: {
              title: (context) => {
                if (!context || context.length === 0 || !context[0] || !context[0].parsed) {
                  return 'Date: N/A';
                }
                const timestamp = context[0].parsed.x;
                if (timestamp === null || timestamp === undefined) {
                  return 'Date: N/A';
                }
                return this.formatDate(timestamp, allSameYear);
              },
              label: (context) => {
                if (!context || !context.parsed) {
                  return '';
                }
                const rawPoint = context.raw as ChartDataPoint | undefined;
                if (rawPoint?.isHelper) {
                  return '';
                }
                const price = context.parsed.y;
                let label = '';
                if (price === null || price === undefined) {
                  label = 'N/A';
                } else if (price === 0) {
                  label = '$0';
                } else {
                  label = `$${Math.round(price)}`;
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: Math.max(0, globalMinPrice - padding),
            suggestedMax: globalMaxPrice + padding,
            title: {
              display: false,
            },
            ticks: {
              callback: (value) => {
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
            min: minDate - xAxisPadding,
            max: maxDate + xAxisPadding,
            ticks: {
              callback: (value) => {
                const date = new Date(value);
                return this.formatDate(date.getTime(), allSameYear);
              },
            },
          },
        },
        interaction: {
          mode: 'point',
          intersect: true,
        },
        events: ['click', 'mousemove'],
      },
    };

    return chartConfig;
  }

  /**
   * Gets a color for an item by index
   */
  getItemColor(index: number): string {
    return this.itemColors[index % this.itemColors.length];
  }

  /**
   * Formats a date for display
   */
  formatDate(timestamp: number, allSameYear: boolean): string {
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
  }

  /**
   * Converts RGB color to RGBA
   */
  private rgbToRgba(rgb: string, alpha: number): string {
    // Extract RGB values from "rgb(r, g, b)" format
    const match = rgb.match(/\d+/g);
    if (match && match.length === 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
    }
    return rgb;
  }
}


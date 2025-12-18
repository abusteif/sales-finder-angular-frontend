import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: false
})
export class RelativeDatePipe implements PipeTransform {

  transform(value: Date | string | number, format?: 'exact' | 'duration'): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();

    if (format === 'exact' || format === 'duration') {
      return this.getExactDuration(date, now);
    }

    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return years + ' years ago';
    } else if (months > 0) {
      return months + ' months ago';
    } else if (days > 0) {
      return days + ' days ago';
    } else if (hours > 0) {
      return hours + ' hours ago';
    } else if (minutes > 0) {
      return minutes + ' minutes ago';
    } else if (seconds > 0) {
      return seconds + ' seconds ago';
    }

    return 'Just now';
  }

  private getExactDuration(date: Date, now: Date): string {
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let days = now.getDate() - date.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

    if (parts.length === 0) return '0 days';

    if (parts.length === 1) return parts[0];

    const lastPart = parts.pop();
    return `${parts.join(', ')} and ${lastPart}`;
  }

}
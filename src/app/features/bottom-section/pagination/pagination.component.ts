import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 0;
  @Input() set itemsCount(value: number) {
    this.totalPages = Math.ceil(value / this.itemsPerPage);
  }
  @Input() isLastPage: boolean = false;
  @Output() onPageChange = new EventEmitter<number>();

  totalPages: number = 0;

  get visiblePages(): (number | string)[] {
    if (this.totalPages <= 7) {
      // If 7 or fewer pages, show all pages
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    if (this.currentPage <= 4) {
      // Show first 5 pages + ... + last page
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
    } else if (this.currentPage >= this.totalPages - 3) {
      // Show first page + ... + last 5 pages
      pages.push(1);
      pages.push('...');
      for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page + ... + current page + ... + last page
      pages.push(1);
      pages.push('...');
      for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
    }

    return pages;
  }

  onNextPage() {
    this.onPageChange.emit(this.currentPage + 1);
  }

  onPreviousPage() {
    this.onPageChange.emit(this.currentPage - 1);
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.onPageChange.emit(page);
    }
  }

  isCurrentPage(page: number | string): boolean {
    return typeof page === 'number' && page === this.currentPage;
  }

  isEllipsis(page: number | string): boolean {
    return typeof page === 'string' && page === '...';
  }
}

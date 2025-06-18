import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() isLastPage: boolean = false;
  @Output() onPageChange = new EventEmitter<number>();


  onNextPage() {
    this.onPageChange.emit(this.currentPage + 1);
  }

  onPreviousPage() {
    this.onPageChange.emit(this.currentPage - 1);
  }
}

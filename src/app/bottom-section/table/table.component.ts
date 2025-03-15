import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SaleItem } from '../../models/sale-item.model';
import { DatePipe } from '@angular/common';
import { RelativeDatePipe } from './relative-date.pipe';

@Component({
  selector: 'app-table',
  imports: [TableModule, DatePipe, RelativeDatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  items: SaleItem[] = [
    {
      name: "vacum cleaner",
      price: 100,
      store: "BigW",
      category: "Home",
      discount: 10,
      date: new Date(2025, 2, 9, 17, 31, 30)
    },
    {
      name: "vacum cleaner",
      price: 100,
      store: "BigW",
      category: "Home",
      discount: 10,
      date: new Date(2025, 2, 9, 17, 31, 30)
    }
  ]


}

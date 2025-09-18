import { Component, Input } from '@angular/core';
import { Item } from '../../../core/models/item.model';

@Component({
  selector: 'app-items-table',
  standalone: false,
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.css']
})
export class ItemsTableComponent {
  @Input() alertLimitReached: boolean = false;
  @Input() items: Item[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() storesCheckedAt: {name: string, checkedAt: Date}[] = []
}

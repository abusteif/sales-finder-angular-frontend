import { Component } from '@angular/core';
import { TableComponent } from '../table/table.component';
import {
  items
} from '../../store/selectors/top-section';
import { SaleItem } from '../../models/sale-item.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
@Component({
  selector: 'app-bottom-section',
  imports: [TableComponent  ],
  templateUrl: './bottom-section.component.html',
  styleUrl: './bottom-section.component.css'
})
export class BottomSectionComponent {
  items: SaleItem[] = []
  constructor(private store: Store<AppState>) {
    this.store.select(items).subscribe((items) => {
      this.items = items;
    });
  }

}

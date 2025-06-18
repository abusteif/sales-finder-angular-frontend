import { Component } from '@angular/core';
import { ItemsTableComponent } from './features/item-display/items-table/items-table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sales-finder-angular-frontend';
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-item-results',
  standalone: false,
  templateUrl: './alert-item-results.component.html',
  styleUrl: './alert-item-results.component.css'
})
export class AlertItemResultsComponent {
  // Input properties for display data
  @Input() lastItemFound = '';
  @Input() lastItemFoundAt: Date | null = null;
  @Input() lastItemFoundUrl = '';
  @Input() lastItemFoundImageUrl = '';
}

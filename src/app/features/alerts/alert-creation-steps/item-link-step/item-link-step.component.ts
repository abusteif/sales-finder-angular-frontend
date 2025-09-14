import { Component, Input } from '@angular/core';
import { Item } from '../../../../core/models/item.model';

@Component({
  selector: 'app-item-link-step',
  standalone: false,
  templateUrl: './item-link-step.component.html',
  styleUrl: './item-link-step.component.css'
})
export class ItemLinkStepComponent {
  @Input() item: Item | null = null;
}

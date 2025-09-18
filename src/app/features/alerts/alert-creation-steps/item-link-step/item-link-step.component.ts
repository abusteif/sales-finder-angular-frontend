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
  @Input() set isNewAlert(isNewAlert: boolean) {
    this.headingText = isNewAlert ? 'We\'ll create an alert for this item' : 'We\'ll update the alert for this item';
  }
  headingText = 'We\'ll create an alert for this item';

}

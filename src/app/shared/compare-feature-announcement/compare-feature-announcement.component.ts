import { Component } from '@angular/core';

@Component({
  selector: 'app-compare-feature-announcement',
  standalone: false,
  templateUrl: './compare-feature-announcement.component.html',
  styleUrl: './compare-feature-announcement.component.css'
})
export class CompareFeatureAnnouncementComponent {
  readonly title = `New: Compare Items Feature`;
  readonly buttonText = 'Try It Now!';
}


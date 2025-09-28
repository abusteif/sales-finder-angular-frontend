import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-faq-page',
  standalone: false,
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css', '../../shared/icons.css'],
  encapsulation: ViewEncapsulation.None
})
export class FaqPageComponent {
  expandedQuestion: number | null = null;

  constructor(private navigationService: NavigationService) {}

  toggleQuestion(index: number): void {
    this.expandedQuestion = this.expandedQuestion === index ? null : index;
  }

  contactUs(): void {
    window.open('/contact-us', '_blank');
  }
}

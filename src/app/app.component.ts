import { Component } from '@angular/core';
import { TopSectionComponent } from './top-section/top-section/top-section.component';
import { BottomSectionComponent } from './bottom-section/bottom-section/bottom-section.component';

@Component({
  selector: 'app-root',
  imports: [TopSectionComponent, BottomSectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sales-finder';
}

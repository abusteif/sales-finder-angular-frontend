import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-top-section',
  imports: [SliderComponent, DropdownComponent],
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.css'
})
export class TopSectionComponent {

}

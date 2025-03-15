import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { Picker } from '../../models/top-section.models';
import { SectionComponent } from '../../shared/section/section.component';

@Component({
  selector: 'app-top-section',
  imports: [SliderComponent, DropdownComponent, SectionComponent],
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.css'
})
export class TopSectionComponent {
  stores: Picker[] = [{name:"BigW", code:"bigw"}];
  categories: Picker[] = [{name:"Toys", code:"toys"}];
}

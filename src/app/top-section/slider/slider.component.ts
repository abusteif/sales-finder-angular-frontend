import { Component } from '@angular/core';
import { Slider } from 'primeng/slider';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-slider',
  imports: [Slider, FormsModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  rangeValues: number[] = [20, 80];
}

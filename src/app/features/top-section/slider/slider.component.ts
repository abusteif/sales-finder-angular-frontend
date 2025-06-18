import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: false,
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  @Input() range: number[] = [0, 100];
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() label: string = '';
  @Input() step: number = 1;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 100;
  @Output() onRangeChange = new EventEmitter<number[]>();

  // Helper method to format display value
  formatDisplayValue(value: number): string {
    return value >= 991 ? '999+' : value.toString();
  }

  // Helper method to get display value for min
  get minDisplayValue(): string {
    return this.formatDisplayValue(this.range[0]);
  }

  // Helper method to get display value for max
  get maxDisplayValue(): string {
    return this.formatDisplayValue(this.range[1]);
  }

  onMinBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value)
    if (isNaN(value)) {
      target.value = this.minDisplayValue;
    } else if (value < this.min) {
      target.value = this.formatDisplayValue(this.min);
      this.range[0] = this.min;
    } else if (value > this.range[1]) {
      target.value = this.maxDisplayValue;
      this.range[0] = this.range[1];
    } else {
      this.range[0] = value;
      target.value = this.formatDisplayValue(value);
    }
    this.onRangeChange.emit(this.range);
  }

  onMaxBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value)
    if (isNaN(value)) {
      target.value = this.maxDisplayValue;
    } else if (value > this.max) {
      target.value = this.formatDisplayValue(this.max);
      this.range[1] = this.max;
    } else if (value < this.range[0]) {
      target.value = this.minDisplayValue;
      this.range[1] = this.range[0];
    } else {
      this.range[1] = value;
      target.value = this.formatDisplayValue(value);
    }
    this.onRangeChange.emit(this.range);
  }

  selectAllText(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
  }
}

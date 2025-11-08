import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-range',
  standalone: false,
  templateUrl: './input-range.component.html',
  styleUrl: './input-range.component.css'
})
export class InputRangeComponent {
  @Input() label: string = '';
  @Input() minLabel: string = 'Min';
  @Input() maxLabel: string = 'Max';
  @Input() range: number[] = [0, 100];
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() placeholder: string = '';
  @Output() onRangeChange = new EventEmitter<number[]>();

  onMinChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      return;
    }
    // Clamp value between min and current max value
    const minValue = Math.max(this.min, Math.min(value, this.range[1]));
    const newRange = [minValue, this.range[1]];
    this.range = newRange;
    this.onRangeChange.emit(this.range);
  }

  onMaxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      return;
    }
    // Clamp value between current min value and max
    const maxValue = Math.max(this.range[0], Math.min(value, this.max));
    const newRange = [this.range[0], maxValue];
    this.range = newRange;
    this.onRangeChange.emit(this.range);
  }
}


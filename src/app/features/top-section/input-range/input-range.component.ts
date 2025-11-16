import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Input() set range(range: number[]) {
    this.lowerValue = range[0];
    this.upperValue = range[1];
  }

  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() placeholder: string = 'Any';
  @Output() onRangeChange = new EventEmitter<number[]>();
  constructor(private cdr: ChangeDetectorRef) {}
  lowerValue: number = 0;
  upperValue: number = 100;

  onMinChange(value: number | null) {
    if (value === null || isNaN(value)) {
      return;
    }
    const minValue = Math.max(this.min, Math.min(value, this.upperValue));
    this.onRangeChange.emit([minValue, this.upperValue]);
    this.cdr.detectChanges();
  }

  onMaxChange(value: number | null) {
    if (value === null || isNaN(value)) {
      return;
    }
    this.cdr.detectChanges();
    const maxValue = Math.max(this.lowerValue, Math.min(value, this.max));
    this.onRangeChange.emit([this.lowerValue, maxValue]);
  }
}


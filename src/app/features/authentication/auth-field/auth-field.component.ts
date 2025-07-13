import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-auth-field',
  standalone: false,
  templateUrl: './auth-field.component.html',
  styleUrl: './auth-field.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthFieldComponent),
      multi: true
    }
  ]
})
export class AuthFieldComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';
  @Input() showPasswordToggle: boolean = false;
  @Input() icon: string = '';
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  value: string = '';
  showPassword: boolean = false;
  isFocused: boolean = false;

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Component methods
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.blur.emit();
  }

  onFocus(): void {
    this.isFocused = true;
    this.focus.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getInputType(): string {
    if (this.type === 'password' && this.showPasswordToggle) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  getFieldClass(): string {
    let classes = 'auth-field';
    if (this.isFocused) classes += ' focused';
    if (this.errorMessage) classes += ' error';
    if (this.disabled) classes += ' disabled';
    return classes;
  }
}

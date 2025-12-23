import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { EllipsisMenuOption } from '../../core/models/ellipsis-menu.model';

@Component({
  selector: 'app-ellipsis-menu',
  standalone: false,
  templateUrl: './ellipsis-menu.component.html',
  styleUrls: ['./ellipsis-menu.component.css']
})
export class EllipsisMenuComponent {
  isMenuOpen = false;

  @Input() options: EllipsisMenuOption[] = [];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu(event: MouseEvent) {
    event.preventDefault();
    this.isMenuOpen = !this.isMenuOpen;
  }

  onOptionClick(event: MouseEvent, option: EllipsisMenuOption) {
    event.preventDefault();
    option.action();
    this.isMenuOpen = false;
  }
}


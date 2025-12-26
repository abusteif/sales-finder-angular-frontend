import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriesStore } from '../../../state/categories.store';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';

@Component({
  selector: 'app-walkthrough-categories-step',
  standalone: false,
  templateUrl: './walkthrough-categories-step.component.html',
  styleUrls: ['./walkthrough-categories-step.component.css'],
})
export class WalkthroughCategoriesStepComponent {
  appName = GENERIC_SETTINGS.app_name;
  
  @Input() selectedCategories: string[] = [];
  
  @Output() selectedCategoriesChange = new EventEmitter<string[]>();
  @Output() continue = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  @Input() categories: string[] = [];
  loading = false;

  constructor(
    private categoriesStore: CategoriesStore
  ) {
  }


  onCategoryToggle(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  onContinue() {
    this.continue.emit();
  }

  onSkip() {
    this.skip.emit();
  }
}


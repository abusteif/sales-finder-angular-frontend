import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriesStore } from '../../../state/categories.store';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';
import { AnalyticsService } from '../../../core/services/analytics.service';

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
    private categoriesStore: CategoriesStore,
    private analyticsService: AnalyticsService
  ) {
  }


  onCategoryToggle(category: string) {
    const index = this.selectedCategories.indexOf(category);
    const isSelected = index > -1;
    
    if (isSelected) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    
    // Track category selection (only when selected, not on every toggle to reduce noise)
    if (!isSelected) {
      this.analyticsService.trackEvent('walkthrough_selection', {
        selection_type: 'category',
        value: category,
        selected: true,
        step: 2,
        total_selected: this.selectedCategories.length + 1
      });
    }
    
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  areAllSelected(): boolean {
    return this.categories.length > 0 && this.selectedCategories.length === this.categories.length;
  }

  onSelectAll() {
    this.selectedCategories = [...this.categories];
    this.analyticsService.trackEvent('button_click', {
      button_name: 'select_all',
      page: 'walkthrough',
      step: 2,
      categories_count: this.categories.length
    });
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }

  onSelectNone() {
    this.selectedCategories = [];
    this.analyticsService.trackEvent('button_click', {
      button_name: 'select_none',
      page: 'walkthrough',
      step: 2
    });
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }

  onContinue() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'continue',
      page: 'walkthrough',
      step: 2,
      categories_selected: this.selectedCategories.length
    });
    this.continue.emit();
  }

  onSkip() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'skip',
      page: 'walkthrough',
      step: 2
    });
    this.skip.emit();
  }
}


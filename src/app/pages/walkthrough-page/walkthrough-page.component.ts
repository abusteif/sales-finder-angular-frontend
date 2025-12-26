import { Component, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesStore } from '../../state/categories.store';
import { FilterStore } from '../../state/filter.store';

@Component({
  selector: 'app-walkthrough-page',
  standalone: false,
  templateUrl: './walkthrough-page.component.html',
  styleUrls: ['./walkthrough-page.component.css'],
})
export class WalkthroughPageComponent implements OnInit {
  currentStep = 1;
  browsingDeals = false;
  trackingItems = false;
  selectedCategories: string[] = [];
  categories: string[] = [];
  constructor(
    private router: Router,
    private categoriesStore: CategoriesStore,
    private filterStore: FilterStore
  ) {
    effect(() => {
      this.categories = this.categoriesStore.categoriesList().sort();
    });
  }

  ngOnInit() {
    this.categoriesStore.loadCategories([]);
  }

  onBrowsingDealsChange(checked: boolean) {
    this.browsingDeals = checked;
  }

  onTrackingItemsChange(checked: boolean) {
    this.trackingItems = checked;
  }

  onStepOneContinue() {
    if (this.browsingDeals) {
      // Move to categories step if browsing deals is selected (prioritize this if both are selected)
      this.currentStep = 2;
    } else if (this.trackingItems) {
      // Move to alert creation step if only tracking items is selected
      this.currentStep = 3;
    } else {
      // Skip to next step or complete walkthrough
      this.completeWalkthrough();
    }
  }

  onSelectedCategoriesChange(categories: string[]) {
    this.selectedCategories = categories;
  }

  onCategoriesStepContinue() {
    this.filterStore.setSelectedCategories(this.selectedCategories);
    // If tracking items is also selected, go to alert creation step next
    if (this.trackingItems) {
      this.currentStep = 3;
    } else {
      // Otherwise complete the walkthrough
      this.completeWalkthrough();
    }
  }

  onSkip() {
    this.router.navigate(['/']);
  }

  private completeWalkthrough() {
    // TODO: Save walkthrough preferences and navigate to home
    console.log('Walkthrough completed:', {
      browsingDeals: this.browsingDeals,
      trackingItems: this.trackingItems,
      selectedCategories: this.selectedCategories
    });
    this.router.navigate(['/']);
  }
}


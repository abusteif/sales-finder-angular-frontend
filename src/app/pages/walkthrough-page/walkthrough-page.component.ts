import { Component, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesStore } from '../../state/categories.store';
import { FilterStore } from '../../state/filter.store';
import { StorageService } from '../../core/services/storage.service';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';
import { AnalyticsService } from '../../core/services/analytics.service';

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
    private filterStore: FilterStore,
    private storageService: StorageService,
    private analyticsService: AnalyticsService
  ) {
    effect(() => {
      this.categories = this.categoriesStore.categoriesList().sort();
    });
  }

  ngOnInit() {
    this.categoriesStore.loadCategories([]);
    // Track walkthrough start
    this.analyticsService.trackEvent('walkthrough_start', {
      step: this.currentStep
    });
    // Page view is already tracked automatically via route monitoring
  }

  onBrowsingDealsChange(checked: boolean) {
    this.browsingDeals = checked;
  }

  onTrackingItemsChange(checked: boolean) {
    this.trackingItems = checked;
  }

  onStepOneContinue() {
    // Track step 1 continue
    this.analyticsService.trackEvent('walkthrough_step_continue', {
      step: 1,
      browsing_deals: this.browsingDeals,
      tracking_items: this.trackingItems
    });

    if (this.browsingDeals) {
      // Move to categories step if browsing deals is selected (prioritize this if both are selected)
      this.currentStep = 2;
      // Page view is already tracked automatically via route monitoring
    } else if (this.trackingItems) {
      // Move to alert creation step if only tracking items is selected
      this.currentStep = 3;
      // Page view is already tracked automatically via route monitoring
    } else {
      // Skip to next step or complete walkthrough
      this.completeWalkthrough();
    }
  }

  onSelectedCategoriesChange(categories: string[]) {
    this.selectedCategories = categories;
  }

  onCategoriesStepContinue() {
    // Track step 2 continue
    this.analyticsService.trackEvent('walkthrough_step_continue', {
      step: 2,
      categories_selected: this.selectedCategories.length,
      categories: this.selectedCategories
    });

    this.filterStore.setSelectedCategories(this.selectedCategories);
    // If tracking items is also selected, go to alert creation step next
    if (this.trackingItems) {
      this.currentStep = 3;
      // Page view is already tracked automatically via route monitoring
    } else {
      // Otherwise complete the walkthrough
      this.completeWalkthrough();
    }
  }

  onSkip() {
    // Track skip event
    this.analyticsService.trackEvent('walkthrough_skip', {
      step: this.currentStep
    });
    this.completeWalkthrough();
  }

  private completeWalkthrough() {
    // Track walkthrough completion
    this.analyticsService.trackEvent('walkthrough_complete', {
      final_step: this.currentStep,
      browsing_deals: this.browsingDeals,
      tracking_items: this.trackingItems,
      categories_selected: this.selectedCategories.length
    });
    this.router.navigate(['/']);
  }
}


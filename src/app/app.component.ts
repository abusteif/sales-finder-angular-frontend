import { Component } from '@angular/core';
import { ItemsTableComponent } from './features/item-display/items-table/items-table.component';
import { AppStore } from './state/app.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sales-finder-angular-frontend';

  constructor(private appStore: AppStore) {
  }
  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  } 

  checkScreenSize() {
    const isMobile = window.innerWidth < 768;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.appStore.setScreenDetails(isMobile, screenWidth, screenHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

}

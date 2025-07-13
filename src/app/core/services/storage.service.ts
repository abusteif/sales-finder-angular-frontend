import { Injectable } from '@angular/core';
import { AuthData, UserPreferences } from '../models/storage.model';
import { User } from '../models/user.models';
import { Filter } from '../models/filter.model';
import { SortCriteria } from '../models/sort.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_DETAILS_KEY = 'user_details';
  
  private readonly USER_PREFERENCES_KEY = 'user_preferences';


  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  setUserDetails(user: User): void {
    localStorage.setItem(this.USER_DETAILS_KEY, JSON.stringify(user));
  }

  getUserDetails(): User | null {
    const userDetails = localStorage.getItem(this.USER_DETAILS_KEY);
    return userDetails ? JSON.parse(userDetails) : null;
  }

  clearAuth(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DETAILS_KEY);
  }

  setFilterPreferences(filter: Filter): void {
    const existingPreferences = this.getUserPreferences();
    const existingFilter = existingPreferences?.filter;
    const updated = { ...existingPreferences, filter: { ...existingFilter, ...filter } };
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(updated));
  }

  setSortPreferences(sort: SortCriteria): void {
    const existing = this.getUserPreferences();
    const updated = { ...existing, sort };
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(updated));
  }

  setItemsPerPage(itemsPerPage: number): void {
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(itemsPerPage));
  }

  getUserPreferences(): UserPreferences | null {
    const prefs = localStorage.getItem(this.USER_PREFERENCES_KEY);
    return prefs ? JSON.parse(prefs) : null;
  }

  getStorageSize(): number {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }

  getStorageSizeInMB(): number {
    return this.getStorageSize() / (1024 * 1024);
  }

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

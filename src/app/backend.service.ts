import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from './configs';
import { SaleItem } from './models/sale-item.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient) { }

  getStores() {
    return this.httpClient.get<string[]>(`${BACKEND_URL}/stores`);
  }

  getCategories(store: string) {
    return this.httpClient.get<string[]>(`${BACKEND_URL}/categories/${store}`);
  }

  getItems(store: string, category: string) {
    return this.httpClient.get<SaleItem[]>(`${BACKEND_URL}/items/${store}/${category}`);
  }

}

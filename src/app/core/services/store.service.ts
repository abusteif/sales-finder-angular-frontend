import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Store } from '../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private storesBaseUrl = `${environment.apiBaseUrl}/stores`;

  constructor(private http: HttpClient) {}

    getStores(): Observable<Store[]> {
        return this.http.get<Store[]>(this.storesBaseUrl).pipe(
            map((stores: Store[]) => {
                return stores
            })
        );
    }
}

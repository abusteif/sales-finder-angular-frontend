import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemDetails } from '../models/item.model';

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    private itemBaseUrl = `${environment.apiBaseUrl}/item`;
    private headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    constructor(private http: HttpClient) { }

    getItemDetails(itemId: string): Observable<ItemDetails> {
        return this.http.get<ItemDetails>(`${this.itemBaseUrl}/${itemId}`, {
            headers: this.headers
        });
    }
}


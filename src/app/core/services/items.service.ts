import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemsAPIResponse } from '../models/item.model';

@Injectable({
    providedIn: 'root'
})
export class ItemsService {
    private itemsBaseUrl = `${environment.apiBaseUrl}/items`;
    private headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });
    constructor(private http: HttpClient) {}

    // Get all items
    getItems(conditions: any): Observable<ItemsAPIResponse> {
        const body = JSON.stringify(conditions);
        return this.http.post<ItemsAPIResponse>(this.itemsBaseUrl, body, {
            headers: this.headers
        });
    }
}
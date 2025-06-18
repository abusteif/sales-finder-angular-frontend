import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    private categoriesBaseUrl = `${environment.apiBaseUrl}/categories`;
    constructor(private http: HttpClient) {}

    getCategories(stores: string[]): Observable<Category[]> {
        return this.http.post<Category[]>(this.categoriesBaseUrl, { stores });
    }
}


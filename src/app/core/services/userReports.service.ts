import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserReportsService {
    private userReportsBaseUrl = `${environment.apiBaseUrl}/user-reports`;

    constructor(private http: HttpClient) {}

    reportSaleExpiry(itemId: string): Observable<any> {
        const url = `${this.userReportsBaseUrl}/sale-expiry`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        const body = JSON.stringify({
            itemId: itemId
        });
        return this.http.post<any>(url, body, { headers });
    }
    setFeaturedStatus(itemId: string, isFeatured: boolean): Observable<any> {
        const url = `${this.userReportsBaseUrl}/manual-feature`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        const body = JSON.stringify({
            itemId: itemId,
            isFeatured: isFeatured
        });
        return this.http.put<any>(url, body, { headers });
    }
}   
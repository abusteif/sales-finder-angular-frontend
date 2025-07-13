import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Alert } from "../models/alert.model";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AlertService {
  private http = inject(HttpClient);

  getAlerts() {
    const url = `${environment.apiBaseUrl}/alerts`;
    return this.http.get<Alert[]>(url);
  }
}
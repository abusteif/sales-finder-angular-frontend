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

  getAlert(alertId: string) {
    const url = `${environment.apiBaseUrl}/alert/${alertId}`;
    return this.http.get<Alert>(url);
  }

  createAlert(alert: Alert) {
    const url = `${environment.apiBaseUrl}/alert`;
    return this.http.post<Alert>(url, alert);
  }

  deleteAlert(alertId: string) {
    const url = `${environment.apiBaseUrl}/alert`;
    const payload = {
      id: alertId
    };
    return this.http.delete(url, { body: payload });
  }

  updateAlert(alert: Alert) {
    const url = `${environment.apiBaseUrl}/alert`;
    return this.http.put<Alert>(url, alert);
  }

  updateAlertStatus(alertId: string, isActive: boolean) {
    const url = `${environment.apiBaseUrl}/alert/status`;
    const payload = {
      id: alertId,
      isActive: isActive
    };
    return this.http.put(url, payload);
  }
}
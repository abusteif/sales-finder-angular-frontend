import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private http: HttpClient) {}

  private contactUrl = `${environment.apiBaseUrl}/contact`;

  submitContactForm(contactData: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.contactUrl, contactData);
  }
}

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "../models/user.models";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    constructor(private http: HttpClient) {}

    private authBaseUrl = `${environment.apiBaseUrl}/auth`;

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(`${this.authBaseUrl}/token`, { email, password });
  }

  register(email: string, password: string, firstName: string, lastName: string) {
    return this.http.post<{ accessToken: string }>(`${this.authBaseUrl}/register`, { 
      email, 
      password, 
      firstName, 
      lastName 
    });
  }

  logout(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ token: string }>(`${this.authBaseUrl}/logout`, {}, { headers });
  }

  activateAccount(token: string) {
    return this.http.post<{ message: string }>(`${this.authBaseUrl}/verify-email`, { token });
  }
}
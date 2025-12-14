import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  private authBaseUrl = `${environment.apiBaseUrl}/auth`;

  login(
    email: string,
    password: string,
    stayLoggedIn: boolean = false
  ): Observable<HttpResponse<{ message?: string }>> {
    return this.http.post<{ message?: string }>(
      `${this.authBaseUrl}/login`,
      { email, password, rememberMe: stayLoggedIn },
      {
        observe: 'response' as const,
      }
    );
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    return this.http.post<{ message?: string }>(
      `${this.authBaseUrl}/register`,
      {
        email,
        password,
        firstName,
        lastName,
      }
    );
  }

  logout() {
    // Cookies are automatically sent by the browser, backend will clear them
    return this.http.post<{ message?: string }>(
      `${this.authBaseUrl}/logout`,
      {}
    );
  }

  activateAccount(token: string) {
    return this.http.post<{ message: string }>(
      `${this.authBaseUrl}/verify-email`,
      { token }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(
      `${this.authBaseUrl}/forgot-password/confirm`,
      {
        token,
        newPassword,
      }
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<{ message: string }>(
      `${this.authBaseUrl}/forgot-password`,
      { email }
    );
  }
}

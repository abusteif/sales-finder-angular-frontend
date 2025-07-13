import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userBaseUrl = `${environment.apiBaseUrl}/user`;

    constructor(private http: HttpClient) {}

    // Get all items
    getUserDetails(): Observable<User> {
        return this.http.get<User>(`${this.userBaseUrl}`);
    }
}
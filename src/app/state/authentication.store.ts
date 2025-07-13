import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthenticationService } from "../core/services/authentication.service";
import { User } from "../core/models/user.models";
import { UserService } from "../core/services/user.service";
import { StorageService } from "../core/services/storage.service";
import { NavigationService } from "../core/services/navigation.service";

interface AuthenticationState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationStore extends signalStore(
    withState<AuthenticationState>({
        token: null,
        user: null,
        isLoading: false,
        error: null
    }),
    withMethods((authentication) => {
        const authenticationService = inject(AuthenticationService);
        const userService = inject(UserService);
        const storageService = inject(StorageService);
        const navigationService = inject(NavigationService);
        return {
            login: (email: string, password: string, stayLoggedIn: boolean) => {
                patchState(authentication, { isLoading: true, error: null });
                authenticationService.login(email, password).subscribe({
                    next: (response) => {
                        if (stayLoggedIn) {
                            storageService.setAuthToken(response.accessToken);
                        }
                        patchState(authentication, { 
                            token: response.accessToken, 
                            isLoading: false, 
                            error: null 
                        });
                        userService.getUserDetails().subscribe({
                            next: (userResponse) => {
                                patchState(authentication, { user: userResponse });
                                if (stayLoggedIn) {
                                    storageService.setUserDetails(userResponse);
                                }
                            },
                            error: (error) => {
                                console.error('Failed to get user details:', error);
                            }
                        });
                    },
                    error: (error) => {
                        console.error(error);
                        patchState(authentication, { isLoading: false, error: error.error.message });
                    }
                });
            },
            logout: () => {
                const currentToken = authentication.token();
                patchState(authentication, {isLoading: true, error: null });
                
                if (currentToken) {
                    authenticationService.logout(currentToken).subscribe({
                        next: () => {
                            patchState(authentication, { 
                                token: null, 
                                user: null,
                                isLoading: false, 
                                error: null 
                            });
                            storageService.clearAuth();
                            navigationService.handleNavigationAfterLogout();
                        },
                        error: (error) => {
                            patchState(authentication, { 
                                isLoading: false, 
                                error: error.error.message 
                            });
                            // Even if logout fails, clear local state and redirect if on protected route
                            storageService.clearAuth();
                            navigationService.handleNavigationAfterLogout();
                        }
                    });
                } else {
                    // No token to logout, just clear the state
                    patchState(authentication, { 
                        token: null, 
                        user: null,
                        isLoading: false, 
                        error: null 
                    });
                    storageService.clearAuth();
                    navigationService.handleNavigationAfterLogout();
                }
            },
            isAuthenticated: () => {
                return !!(authentication.token() && authentication.user());
            },
            initialiseAuth: () => {
                const token = storageService.getAuthToken()
                patchState(authentication, { token });
                if (token) {
                    userService.getUserDetails().subscribe({
                        next: (response) => {
                            patchState(authentication, { token, user: response });
                            storageService.setUserDetails(response);
                        },
                        error: (error) => {
                            console.error('Failed to get user details:', error);
                            // Clear invalid token and redirect to login
                            patchState(authentication, { 
                                token: null, 
                                user: null,
                                isLoading: false, 
                                error: null 
                            });
                            storageService.clearAuth();
                            navigationService.handleNavigationAfterLogout();
                        }
                    });
                }
            }
        }
    })
) {
}
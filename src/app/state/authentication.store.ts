import { inject, Injectable } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthenticationService } from '../core/services/authentication.service';
import { User } from '../core/models/user.models';
import { UserService } from '../core/services/user.service';
import { StorageService } from '../core/services/storage.service';
import { NavigationService } from '../core/services/navigation.service';
import { USER_DETAILS_KEY } from '../core/constants/authentication';
import { switchMap, delay } from 'rxjs/operators';

interface AuthenticationState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationStore extends signalStore(
  withState<AuthenticationState>({
    user: null,
    isLoading: false,
    error: null,
  }),
  withMethods((authentication) => {
    const authenticationService = inject(AuthenticationService);
    const userService = inject(UserService);
    const storageService = inject(StorageService);
    const navigationService = inject(NavigationService);
    const deleteAuthData = () => {
      storageService.clearAuth();
      sessionStorage.removeItem(USER_DETAILS_KEY);
    };
    return {
      login: (email: string, password: string, stayLoggedIn: boolean) => {
        patchState(authentication, { isLoading: true, error: null });
        authenticationService
          .login(email, password, stayLoggedIn)
          .pipe(
            switchMap(() => {
              return userService.getUserDetails();
            })
          )
          .subscribe({
            next: (userResponse) => {
              patchState(authentication, {
                user: userResponse,
                isLoading: false,
                error: null,
              });
              if (stayLoggedIn) {
                storageService.setUserDetails(userResponse);
              }
              sessionStorage.setItem(
                USER_DETAILS_KEY,
                JSON.stringify(userResponse)
              );
            },
            error: (error) => {
              console.error('Login or getUserDetails error:', error);
              patchState(authentication, {
                user: null,
                isLoading: false,
                error: error.error?.message || 'Login failed',
              });
              if (error.status === 403 || error.status === 401) {
                deleteAuthData();
              }
            },
          });
      },
      logout: () => {
        patchState(authentication, { isLoading: true, error: null });

        authenticationService.logout().subscribe({
          next: () => {
            patchState(authentication, {
              user: null,
              isLoading: false,
              error: null,
            });
            deleteAuthData();
            navigationService.handleNavigationAfterLogout();
          },
          error: (error) => {
            patchState(authentication, {
              isLoading: false,
              error: error.error?.message || 'Logout failed',
            });
            deleteAuthData();
            navigationService.handleNavigationAfterLogout();
          },
        });
      },
      isAuthenticated: () => {
        return !!authentication.user();
      },
      clearAuth: () => {
        patchState(authentication, {
          user: null,
          isLoading: false,
          error: null,
        });
        deleteAuthData();
      },
      initialiseAuth: () => {
        const storedUser =
          storageService.getUserDetails() ||
          (sessionStorage.getItem(USER_DETAILS_KEY)
            ? JSON.parse(sessionStorage.getItem(USER_DETAILS_KEY)!)
            : null);

        if (storedUser) {
          patchState(authentication, { user: storedUser });
        }
        userService.getUserDetails().subscribe({
          next: (response) => {
            patchState(authentication, { user: response });
            storageService.setUserDetails(response);
            sessionStorage.setItem(USER_DETAILS_KEY, JSON.stringify(response));
          },
          error: (error) => {
            console.error('Failed to get user details:', error);
            patchState(authentication, {
              user: null,
              isLoading: false,
              error: null,
            });
            if (error.status === 403 || error.status === 401) {
              deleteAuthData();
              navigationService.handleNavigationAfterLogout();
            }
          },
        });
      }
    };
  })
) {}

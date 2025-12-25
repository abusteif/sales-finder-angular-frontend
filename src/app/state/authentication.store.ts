import { inject, Injectable } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AuthenticationService } from '../core/services/authentication.service';
import { User } from '../core/models/user.models';
import { UserService } from '../core/services/user.service';
import { StorageService } from '../core/services/storage.service';
import { NavigationService } from '../core/services/navigation.service';
import { USER_DETAILS_KEY } from '../core/constants/authentication';
import { pipe, switchMap, tap, catchError, map } from 'rxjs';
import { of } from 'rxjs';

interface AuthenticationState {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationStore extends signalStore(
  withState<AuthenticationState>({
    user: null,
    isLoading: false,
    isLoggingOut: false,
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
      login: rxMethod<{
        email: string;
        password: string;
        stayLoggedIn: boolean;
      }>(
        pipe(
          tap(() =>
            patchState(authentication, { isLoading: true, error: null })
          ),
          switchMap(({ email, password, stayLoggedIn }) =>
            authenticationService
              .login(email, password, stayLoggedIn)
              .pipe(
                switchMap(() =>
                  userService
                    .getUserDetails()
                    .pipe(
                      map((userResponse) => ({ userResponse, stayLoggedIn }))
                    )
                )
              )
          ),
          tap(({ userResponse, stayLoggedIn }) => {
            patchState(authentication, {
              user: userResponse,
              isLoading: false,
              error: null,
            });
            if (userResponse) {
              if (stayLoggedIn) {
                storageService.setUserDetails(userResponse);
              }
              sessionStorage.setItem(
                USER_DETAILS_KEY,
                JSON.stringify(userResponse)
              );
            }
          }),
          catchError((error) => {
            console.error('Login or getUserDetails error:', error);
            patchState(authentication, {
              user: null,
              isLoading: false,
              error: error.error?.message || 'Login failed',
            });
            if (error.status === 403 || error.status === 401) {
              deleteAuthData();
            }
            return of(null);
          })
        )
      ),
      logout: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(authentication, { isLoggingOut: true, error: null })
          ),
          switchMap(() => authenticationService.logout()),
          tap(() => {
            patchState(authentication, {
              user: null,
              isLoggingOut: false,
              error: null,
            });
            deleteAuthData();
            navigationService.handleNavigationAfterLogout();
          }),
          catchError((error) => {
            patchState(authentication, {
              isLoggingOut: false,
              error: error.error?.message || 'Logout failed',
            });
            deleteAuthData();
            navigationService.handleNavigationAfterLogout();
            return of(null);
          })
        )
      ),
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
      initialiseAuth: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(authentication, { isLoading: true, error: null });
          }),
          switchMap(() => authenticationService.checkAuthenticationStatus()),
          switchMap((authStatus) => {
            if (!authStatus.isAuthenticated) {
              patchState(authentication, { user: null, isLoading: false, error: null });
              return of(null);
            }
            return userService.getUserDetails();
          }),
          tap((response) => {
            if (response) {
              patchState(authentication, { user: response, isLoading: false, error: null });
              storageService.setUserDetails(response);
            }
          }),
          catchError((error) => {
            console.error(
              'Failed to check authentication status or get user details:',
              error
            );
            patchState(authentication, {
              user: null,
              isLoading: false,
              error: null,
            });
            if (error.status === 403 || error.status === 401) {
              navigationService.handleNavigationAfterLogout();
            }
            return of(null);
          })
        )
      ),
    };
  })
) {}

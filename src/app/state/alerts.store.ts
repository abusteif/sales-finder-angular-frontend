import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Alert } from "../core/models/alert.model";
import { AlertService } from "../core/services/alert.service";
import { StatusDialogService } from "../core/services/status-dialog.service";
import { pipe, switchMap, tap, catchError, mergeMap } from "rxjs";
import { of } from "rxjs";

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AlertsStore extends signalStore(
  withState<AlertsState>({ alerts: [], loading: false, creating: false, updating: false, error: null }),
  withMethods((userAlerts) => {
    const alertService = inject(AlertService);
    const statusDialogService = inject(StatusDialogService);
    return {
      loadAlerts: rxMethod<void>(
        pipe(
          tap(() => patchState(userAlerts, { loading: true, error: null })),
          switchMap(() => alertService.getAlerts()),
          tap((alerts) => {
            patchState(userAlerts, { alerts, loading: false });
          }),
          catchError((error) => {
            patchState(userAlerts, { loading: false, error: error.message });
            return of([]);
          })
        )
      ),
      createAlert: rxMethod<Alert>(
        pipe(
          tap(() => patchState(userAlerts, { creating: true, error: null })),
          switchMap((alert) => alertService.createAlert(alert)),
          switchMap(() => {
            patchState(userAlerts, { creating: false });
            return alertService.getAlerts();
          }),
          tap((alerts) => {
            patchState(userAlerts, { alerts });
          }),
          mergeMap(() => statusDialogService.showSuccess(
            'Alert Created Successfully!',
            `Your price drop alert has been created and is now active.`,
            'Great!'
          )),
          catchError((error) => {
            patchState(userAlerts, { creating: false, error: error.error?.message || error.message });
            statusDialogService.showError(
              'Failed to Create Alert',
              error.error?.message || error.message,
              'OK'
            ).subscribe();
            return of([]);
          })
        )
      ),
      deleteAlert: rxMethod<string>(
        pipe(
          tap(() => patchState(userAlerts, { loading: true, error: null })),
          switchMap((alertId) => alertService.deleteAlert(alertId)),
          switchMap(() => alertService.getAlerts()),
          tap((alerts) => {
            patchState(userAlerts, { alerts, loading: false });
          }),
          catchError((error) => {
            patchState(userAlerts, { loading: false, error: error.error?.message || error.message });
            return of([]);
          })
        )
      ),
      updateAlert: rxMethod<Alert>(
        pipe(
          tap(() => patchState(userAlerts, { updating: true, error: null })),
          switchMap((alert) => 
            alertService.updateAlert(alert).pipe(
              switchMap(() => {
                patchState(userAlerts, { updating: false });
                return alertService.getAlerts().pipe(
                  tap((alerts) => {
                    patchState(userAlerts, { alerts });
                  }),
                  mergeMap(() => statusDialogService.showSuccess(
                    'Alert Updated Successfully!',
                    `Your price drop alert for <strong style="color: #2196F3;">"${alert.item}"</strong> has been updated successfully.`,
                    'Great!'
                  ))
                );
              })
            )
          ),
          catchError((error) => {
            patchState(userAlerts, { updating: false, error: error.error?.message || error.message });
            statusDialogService.showError(
              'Failed to Update Alert',
              error.error?.message || error.message,
              'OK'
            ).subscribe();
            return of([]);
          })
        )
      ),
      updateAlertStatus: rxMethod<{ alertId: string; isActive: boolean }>(
        pipe(
          tap(() => patchState(userAlerts, { loading: true, error: null })),
          switchMap(({ alertId, isActive }) => alertService.updateAlertStatus(alertId, isActive)),
          switchMap(() => alertService.getAlerts()),
          tap((alerts) => {
            patchState(userAlerts, { alerts, loading: false });
          }),
          catchError((error) => {
            patchState(userAlerts, { loading: false, error: error.error?.message || error.message });
            return of([]);
          })
        )
      )
    }
  })
) { }
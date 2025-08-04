import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Alert } from "../core/models/alert.model";
import { AlertService } from "../core/services/alert.service";
import { StatusDialogService } from "../core/services/status-dialog.service";
import { of, tap } from "rxjs";
import { catchError } from "rxjs/operators";

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AlertsStore extends signalStore(
  withState<AlertsState>({ alerts: [], loading: false, creating: false, error: null }),
  withMethods((userAlerts) => {
    const alertService = inject(AlertService);
    const statusDialogService = inject(StatusDialogService);
    return {
      loadAlerts: () => {
        patchState(userAlerts, { loading: true, error: null });
        alertService.getAlerts().pipe(
          tap((alerts) => {
            patchState(userAlerts, { alerts, loading: false });
          }),
          catchError((error) => {
            patchState(userAlerts, { loading: false, error: error.message });
            return of([]);
          })
        ).subscribe();
      },
      createAlert: (alert: Alert) => {
        patchState(userAlerts, { creating: true, error: null });
        alertService.createAlert(alert).pipe(
          tap(() => {
            patchState(userAlerts, { creating: false });
            alertService.getAlerts().pipe(
              tap((alerts) => {
                patchState(userAlerts, { alerts });
              })
            ).subscribe();

            // Show success dialog
            statusDialogService.showSuccess(
              'Alert Created Successfully!',
              `Your price drop alert for "${alert.item}" has been created and is now active.`,
              'Great!'
            ).subscribe();

          }),
          catchError((error) => {
            patchState(userAlerts, { creating: false, error: error.error.message });

            // Show error dialog
            statusDialogService.showError(
              'Failed to Create Alert',
              error.error.message,
              'OK'
            ).subscribe();

            return of([]);
          })
        ).subscribe();
      },
      deleteAlert: (alertId: string) => {

        patchState(userAlerts, { loading: true, error: null });
        alertService.deleteAlert(alertId).pipe(
          tap(() => {
            alertService.getAlerts().pipe(
              tap((alerts) => {
                patchState(userAlerts, { alerts });
              }),
              catchError((error) => {
                patchState(userAlerts, { loading: false, error: error.error.message });
                return of([]);
              })
            ).subscribe();
          })
        ).subscribe();
      },
      updateAlert: (alert: Alert) => {
        patchState(userAlerts, { loading: true, error: null });
        alertService.updateAlert(alert).pipe(
          tap(() => {
            patchState(userAlerts, { loading: false });
            alertService.getAlerts().pipe(
              tap((alerts) => {
                patchState(userAlerts, { alerts });
              }),
              catchError((error) => {
                patchState(userAlerts, { loading: false, error: error.error.message });
                return of([]);
              })
            ).subscribe();
            statusDialogService.showSuccess(
              'Alert Updated Successfully!',
              `Your price drop alert for "${alert.item}" has been updated.`,
              'Great!'
            ).subscribe();
          })
        ).subscribe();
      },
      updateAlertStatus: (alertId: string, isActive: boolean) => {
        patchState(userAlerts, { loading: true, error: null });
        alertService.updateAlertStatus(alertId, isActive).pipe(
          tap(() => {
            patchState(userAlerts, { loading: false });
            alertService.getAlerts().pipe(
              tap((alerts) => {
                patchState(userAlerts, { alerts });
              })
            ).subscribe();
          }),
          catchError((error) => {
            patchState(userAlerts, { loading: false, error: error.error.message });
            return of([]);
          })
        ).subscribe();
      }
    }
  })
) { }
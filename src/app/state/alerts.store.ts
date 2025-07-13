import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Alert } from "../core/models/alert.model";
import { AlertService } from "../core/services/alert.service";
import { of, tap } from "rxjs";
import { catchError } from "rxjs/operators";

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AlertsStore extends signalStore(
  withState<AlertsState>({ alerts: [], loading: false, error: null }),
  withMethods((useAlerts) => {
    const alertService = inject(AlertService);
    return {
      loadAlerts: () => {
        patchState(useAlerts, { loading: true, error: null });
        alertService.getAlerts().pipe(
          tap((alerts) => {
            patchState(useAlerts, { alerts, loading: false });
          }),
          catchError((error) => {
            patchState(useAlerts, { loading: false, error: error.message });
            return of([]);
          })
        ).subscribe();
      }
    }
  })
) {}
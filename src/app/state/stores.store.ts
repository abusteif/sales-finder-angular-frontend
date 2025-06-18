import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '../core/models/store.model';
import { StoreService } from '../core/services/store.service';

interface StoreState {
  stores: Store[];
  // selectedStores: Store[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class storesStore extends signalStore(
  { providedIn: 'root' },
  withState<StoreState>({
    stores: [],
    // selectedStores: [],
    loading: false,
    error: null
  }),
  withMethods((stores) => {
    const storeService = inject(StoreService);

    return {
        loadStores: () => {
            patchState(stores, { loading: true, error: null });

          
            storeService.getStores().pipe(
              tap((storeList) => {
                patchState(stores, {
                  stores: storeList,
                  loading: false,
                });
              }),
              catchError((error) => {
                patchState(stores, {
                  loading: false,
                  error: 'Failed to load stores',
                });
                return of([]);
              })
            ).subscribe();
          },

          
    };
  })
) {}

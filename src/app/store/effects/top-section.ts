import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { BackendService } from '../../backend.service';
import * as topSectionActions from '../actions/top-section';

@Injectable()
export class TopSectionEffects {
  actions$ = inject(Actions);
  backendService = inject(BackendService);

  
  loadStores$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(topSectionActions.getStores),
      exhaustMap(() =>
        this.backendService.getStores().pipe(
          map((stores) => topSectionActions.storesLoaded(stores)),
          catchError(() => EMPTY)
        )
      )
    );
  });

  loadCategories$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(topSectionActions.getCategories),
      exhaustMap(({ store }) =>
        this.backendService.getCategories(store).pipe(
          map((categories) => topSectionActions.categoriesLoaded(categories)),
          catchError(() => EMPTY)
        )
      )
    );
  });
  getItems$ = createEffect(() => {  
    return this.actions$.pipe(
      ofType(topSectionActions.getItems),
      exhaustMap(({ store, category }) =>
        this.backendService.getItems(store, category).pipe(
          map((items) => {
            const modifiedItems = items.map(item => ({
              ...item,
              date: new Date(item.date)
            }));
            return topSectionActions.itemsLoaded(modifiedItems);
          }),
          catchError(() => EMPTY)
        )
      )
    );
  })
}

import { computed, Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { CategoriesService } from '../core/services/categories.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Category } from '../core/models/category.model';
interface CategoriesState {
    categories: Category[];
    categoriesList: string[];
    // selectedCategories: string[];
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriesStore extends signalStore(
    { providedIn: 'root' },
    withState<CategoriesState>({
        categories: [],
        categoriesList: [],
        // selectedCategories: [],
        loading: false,
        error: null
    }),
    withMethods((categories) => {
        const categoriesService = inject(CategoriesService);
        return {
            loadCategories: (stores: string[]) => {
                patchState(categories, { loading: true, error: null });
                categoriesService.getCategories(stores).pipe(
                    tap((categoryList) => {
                        let categoryNames: string[] = [];
                        categoryList.forEach(category => {
                            categoryNames.push(...category.categories);
                        });
                        categoryNames = [...new Set(categoryNames)];
                        patchState(categories, { categories: categoryList, categoriesList: categoryNames, loading: false });

                    }),
                    catchError((error) => {
                        patchState(categories, { loading: false, error: 'Failed to load categories' });
                        return of([]);
                    })
                ).subscribe();
            },
            // setSelectedCategories: (selectedCategories: string[]) => {
            //     patchState(categories, {
            //         selectedCategories
            //     });
            // }

        };
    }),
    // withComputed((categories) => ({
    //     transformedCategories: computed(() => {
    //         const categoryList = categories.categories();
    //         const result: string[] = []
    //         categoryList.forEach(category => {
    //             result.push(...category.categories);
    //         });

    //         return [...new Set(result)];
    //     })
    // }))
    
) { }

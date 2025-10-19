import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DEFAULT_CARDS_PER_ROW, DEFAULT_ITEMS_PER_PAGE } from "../core/constants/display";
import { StorageService } from "../core/services/storage.service";

interface AppState {
    itemsPerPage: number;
    cardsPerRow: number;
    isMobile: boolean;
    screenWidth: number;
    screenHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppStore extends signalStore(
    withState<AppState>({
        itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
        cardsPerRow: DEFAULT_CARDS_PER_ROW,
        isMobile: false,
        screenWidth: 0,
        screenHeight: 0
    }),
    withMethods((app) => {
        const storageService = inject(StorageService);
        return {
            setItemsPerPage: (itemsPerPage: number) => {
                patchState(app, { itemsPerPage });
                storageService.setItemsPerPage(itemsPerPage);
            },
            setCardsPerRow: (cardsPerRow: number) => {
                patchState(app, { cardsPerRow });
                storageService.setCardsPerRow(cardsPerRow);
            },
            setScreenDetails: (isMobile: boolean, screenWidth: number, screenHeight: number) => {
                patchState(app, { isMobile, screenWidth, screenHeight });
            },
            loadDisplaySettings: () => {
                const itemsPerPage = storageService.getUserPreferences()?.itemsPerPage;
                const cardsPerRow = storageService.getUserPreferences()?.cardsPerRow;
                if (itemsPerPage) {
                    patchState(app, { itemsPerPage });
                }
                if (cardsPerRow) {
                    patchState(app, { cardsPerRow });
                }
            }
        }
    })
) {

}
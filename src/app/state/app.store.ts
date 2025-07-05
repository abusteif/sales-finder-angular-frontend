import { Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DEFAULT_ITEMS_PER_PAGE } from "../core/constants/display";

interface AppState {
    itemsPerPage: number;
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
        isMobile: false,
        screenWidth: 0,
        screenHeight: 0
    }),
    withMethods((app) => {
        return {
            setItemsPerPage: (itemsPerPage: number) => {
                patchState(app, { itemsPerPage });
            },
            setScreenDetails: (isMobile: boolean, screenWidth: number, screenHeight: number) => {
                patchState(app, { isMobile, screenWidth, screenHeight });
            }
        }
    })
) {

}
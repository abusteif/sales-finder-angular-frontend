// import { inject, Injectable } from "@angular/core";
// import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
// import { User } from "../core/models/user.models";
// import { UserService } from "../core/services/user.service";
// import { AuthenticationStore } from "./authentication.store";

// interface UserState {
//     user: User | null;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class UserStore extends signalStore(
//     withState<UserState>({
//         user: null,
//     }),
//     withMethods((user) => {
//         const userService = inject(UserService);
//         const authenticationStore = inject(AuthenticationStore);
//         return {
//             getUserDetails: () => {
//                 userService.getUserDetails().subscribe({
//                     next: (userDetails) => {
//                         patchState(user, { user: userDetails });
//                     }
//                 });
//             },
//             logout: () => {
//                 authenticationStore.logout();
//                 patchState(user, { user: null });
//             }
//         }
//     })
// ) {
// }
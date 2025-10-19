import { Filter } from "./filter.model";
import { SortCriteria } from "./sort.model";
import { User } from "./user.models";

export interface UserPreferences {
  filter: Filter;
  sort: SortCriteria;
  itemsPerPage: number;
  cardsPerRow: number;
}

export interface AuthData {
  token: string;
  user: User;
}
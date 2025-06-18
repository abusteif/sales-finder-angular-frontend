import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TextService {
    public capitalizeWords(str: string): string {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }
}

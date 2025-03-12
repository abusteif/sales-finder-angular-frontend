import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor() { }

  getStores() {
    return [
      {name: "BigW", code: "bigw"},
      {name: "Target", code: "target"},
      {name: "Kmart", code: "kmart"},
      {name: "Coles", code: "coles"},
      {name: "Woolworths", code: "woolworths"},
      {name: "Aldi", code: "aldi"},
      {name: "Ikea", code: "ikea"},
    ]
  }
}

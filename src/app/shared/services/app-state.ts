import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppState {
  showCreditsInfo = signal(false);
}

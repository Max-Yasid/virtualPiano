import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxSilkComponent } from '@omnedia/ngx-silk';
import { AppState } from '../../shared/services/app-state';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-credits-info',
  imports: [NgxSilkComponent, MatIcon, MatIconButton],
  templateUrl: './credits-info.html',
  styleUrl: './credits-info.css',
})
export class CreditsInfo {
  appState = inject(AppState);
  close() {
    this.appState.showCreditsInfo.set(false);
  }
}

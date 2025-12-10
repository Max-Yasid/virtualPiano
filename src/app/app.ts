import { Component } from '@angular/core';
import { Keyboard } from './keyboard/keyboard';

@Component({
  selector: 'app-root',
  imports: [Keyboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}

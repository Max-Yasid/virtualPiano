import { Component } from '@angular/core';

@Component({
  selector: 'app-paper-background',
  imports: [],
  templateUrl: './paper-background.html',
  styleUrl: './paper-background.css',
})
export class PaperBackground {
  squaresRowLength = 17;
  squaresColumnLength = 17;
  squareSize = 125;
  grid: { position: number }[][] = [];

  constructor() {
    for (let j = 0; j <= this.squaresColumnLength; j++) {
      const row = new Array(this.squaresRowLength);
      for (let i = 0; i < row.length; i++) {
        row[i] = { position: i + j * this.squaresRowLength };
      }
      this.grid.push(row);
    }
  }
  addGrayBorderToSiblings(rowIndex: number, colIndex: number) {
    const hoveredSquareIndex = rowIndex * this.squaresRowLength + colIndex;
    document.querySelectorAll('.square').forEach((el, index) => {
      if (hoveredSquareIndex === index) {
        el.classList.add('border-gray-50', 'border-solid', 'border-1');
      } else if (el.classList.contains('bg-black')) return;
      else el.classList.remove('border-gray-50', 'border-solid', 'border-1');
    });
  }
  toggleBackgroundColor(element: HTMLDivElement) {
    element.classList.toggle('bg-[#ffff]');
  }
}

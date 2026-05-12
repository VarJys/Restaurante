import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  cantidad= 10;
  incremento(value: number) {
    this.cantidad += value;
  }
  reset() {
    this.cantidad = 10;
  }
  currentYear = new Date().getFullYear();
}

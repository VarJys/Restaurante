import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  user: any = null;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.user$.subscribe(user => {
      this.user = user;
    });
  }
  cantidad= 10;
  incremento(value: number) {
    this.cantidad += value;
  }
  reset() {
    this.cantidad = 10;
  }
  currentYear = new Date().getFullYear();
}

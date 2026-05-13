import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onSubmit() {
    try {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';
      const { data, error } = await this.supabaseService.signUpAdmin(this.email, this.password);
      if (error) {
        this.errorMsg = error.message;
      } else {
        this.successMsg = 'Administrador registrado con éxito. Serás redirigido al panel.';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      }
    } catch (err: any) {
      this.errorMsg = err.message || 'Error inesperado';
    } finally {
      this.loading = false;
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = false;
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    try {
      this.loading = true;
      this.errorMsg = '';
      const { error } = await this.supabaseService.signInWithPassword(this.email, this.password);
      if (error) {
        this.errorMsg = error.message;
      } else {
        // Redirect to inicio or dashboard
        console.log('Login successful');
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.errorMsg = err.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }
}

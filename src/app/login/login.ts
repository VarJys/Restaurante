import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

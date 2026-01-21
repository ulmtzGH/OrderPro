import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  username = 'admin';
  password = 'password'; // Mock password
  errorMessage = signal<string | null>(null);
  
  private authService = inject(AuthService);

  login() {
    this.errorMessage.set(null);
    if (!this.authService.login(this.username, this.password)) {
      this.errorMessage.set('Credenciales inválidas. Intente con "admin" o "waiter".');
    }
  }
}
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
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
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        if (!user) {
          this.errorMessage.set('Credenciales inválidas. Intente con "admin", "waiter" o "cliente".');
        }
      },
      error: () => {
        this.errorMessage.set('Error de conexión con el servidor.');
      }
    });
  }
}
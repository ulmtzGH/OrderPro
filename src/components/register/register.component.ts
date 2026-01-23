import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  registerForm: FormGroup;
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]+$/)]],
      email: ['', [Validators.email]], // Optional but validated if present
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { name, username, phone, email } = this.registerForm.value;

    // Check if username already exists locally before calling service
    if (this.userService.getUserByUsername(username)) {
      this.errorMessage.set('El nombre de usuario ya está en uso.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const userData = {
      name,
      username,
      phone,
      email: email || null
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar usuario. Intente nuevamente.');
      }
    });
  }
}
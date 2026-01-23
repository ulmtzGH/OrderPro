import { Injectable, signal, inject } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { delay, tap, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private userService = inject(UserService);

  currentUser = signal<User | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(username: string, password_unused: string): Observable<User | undefined> {
    // Validate against UserService data
    const user = this.userService.getUserByUsername(username);
    
    // Simulate API delay
    return of(user).pipe(
      delay(500),
      tap(u => {
        if (u) {
          this.currentUser.set(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
          
          if (u.role === 'Customer') {
            this.router.navigate(['/new-order']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      })
    );
  }

  register(userData: { name: string; username: string; phone: string; email: string | null }): Observable<User> {
    const newUser: Omit<User, 'id'> = {
      ...userData,
      role: 'Customer' // Public registration is always Customer
    };

    return this.userService.addUser(newUser).pipe(
      tap(createdUser => {
        // Auto-login after registration
        this.currentUser.set(createdUser);
        localStorage.setItem('currentUser', JSON.stringify(createdUser));
        this.router.navigate(['/new-order']);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }
}
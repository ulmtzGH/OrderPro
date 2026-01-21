import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(username: string, password_unused: string): boolean {
    // Mock authentication logic
    let user: User | null = null;
    if (username.toLowerCase() === 'admin') {
      user = { id: 1, name: 'Admin User', role: 'Admin', username: 'admin' };
    } else if (username.toLowerCase() === 'waiter') {
      user = { id: 2, name: 'Waiter Joe', role: 'Waiter', username: 'waiter' };
    }

    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
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

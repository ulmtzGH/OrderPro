import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { of, Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  // Initial Mock Users
  private initialUsers: User[] = [
    { id: 1, name: 'Admin User', role: 'Admin', username: 'admin', phone: '555-0101', email: 'admin@restaurant.com' },
    { id: 2, name: 'Waiter Joe', role: 'Waiter', username: 'waiter', phone: '555-0102', email: null },
    { id: 3, name: 'Cliente Frecuente', role: 'Customer', username: 'cliente', phone: '555-0103', email: 'cliente@gmail.com' }
  ];

  private usersSignal = signal<User[]>(this.initialUsers);
  users = this.usersSignal.asReadonly();

  getUserByUsername(username: string): User | undefined {
    return this.users().find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  addUser(user: Omit<User, 'id'>): Observable<User> {
    const newUser = {
      ...user,
      id: Math.max(...this.users().map(u => u.id), 0) + 1
    };
    
    return of(newUser).pipe(
      delay(300),
      tap(u => this.usersSignal.update(users => [...users, u]))
    );
  }

  updateUser(updatedUser: User): Observable<User> {
    return of(updatedUser).pipe(
      delay(300),
      tap(u => this.usersSignal.update(users => 
        users.map(user => user.id === u.id ? u : user)
      ))
    );
  }

  deleteUser(userId: number): Observable<void> {
    return of(undefined).pipe(
      delay(300),
      tap(() => this.usersSignal.update(users => 
        users.filter(u => u.id !== userId)
      ))
    );
  }
}
import { ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  private userService = inject(UserService);
  private fb: FormBuilder = inject(FormBuilder);

  private allUsers = this.userService.users;
  
  isModalOpen = signal(false);
  editingUser: WritableSignal<User | null> = signal(null);
  userToDelete = signal<User | null>(null);
  
  userForm: FormGroup;
  roles: UserRole[] = ['Admin', 'Waiter', 'Customer'];
  
  // Filters
  searchTerm = signal('');
  roleFilter = signal<UserRole | 'All'>('All');
  filterRoles: (UserRole | 'All')[] = ['All', 'Admin', 'Waiter', 'Customer'];

  filteredUsers = computed(() => {
    let users = this.allUsers();
    const search = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();

    if (role !== 'All') {
      users = users.filter(u => u.role === role);
    }

    if (search) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.username.toLowerCase().includes(search) ||
        u.phone.includes(search) ||
        (u.email && u.email.toLowerCase().includes(search))
      );
    }

    return users;
  });

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      role: ['Waiter', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]+$/)]],
      email: ['', Validators.email] // Optional but must be valid format if present
    });
  }

  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearchTerm() {
    this.searchTerm.set('');
  }

  setRoleFilter(role: UserRole | 'All') {
    this.roleFilter.set(role);
  }

  openModal(user: User | null = null) {
    this.editingUser.set(user);
    if (user) {
      this.userForm.patchValue(user);
    } else {
      this.userForm.reset({
        role: 'Waiter',
        email: '',
        phone: ''
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;
    // Normalize empty email to null
    if (!formValue.email) {
        formValue.email = null;
    }
    
    if (this.editingUser()) {
      this.userService.updateUser({ ...this.editingUser()!, ...formValue }).subscribe();
    } else {
      this.userService.addUser(formValue).subscribe();
    }
    this.closeModal();
  }

  requestDelete(user: User) {
    this.userToDelete.set(user);
  }

  cancelDelete() {
    this.userToDelete.set(null);
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (user) {
      this.userService.deleteUser(user.id).subscribe();
      this.userToDelete.set(null);
    }
  }
}
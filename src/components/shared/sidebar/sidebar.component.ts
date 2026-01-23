import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.model';

interface NavLink {
    path: string;
    label: string;
    icon: string;
    allowedRoles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);

  userRole = computed(() => this.authService.currentUser()?.role);

  navLinks: NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', allowedRoles: ['Admin', 'Waiter'] },
    { path: '/orders', label: 'Órdenes', icon: '📋', allowedRoles: ['Admin', 'Waiter', 'Customer'] },
    { path: '/new-order', label: 'Nueva Orden', icon: '➕', allowedRoles: ['Admin', 'Waiter', 'Customer'] },
    { path: '/menu-management', label: 'Menú', icon: '🍔', allowedRoles: ['Admin'] },
    { path: '/user-management', label: 'Usuarios', icon: '👥', allowedRoles: ['Admin'] },
  ];

  isLinkAllowed(link: NavLink): boolean {
      const role = this.userRole();
      return role ? link.allowedRoles.includes(role) : false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout() {
    this.authService.logout();
  }
}
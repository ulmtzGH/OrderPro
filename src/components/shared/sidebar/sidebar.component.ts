import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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

  isAdmin = this.authService.hasRole('Admin');

  navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', adminOnly: false },
    { path: '/orders', label: 'Órdenes', icon: '📋', adminOnly: false },
    { path: '/new-order', label: 'Nueva Orden', icon: '➕', adminOnly: false },
    { path: '/menu-management', label: 'Menú', icon: '🍔', adminOnly: true },
    { path: '/user-management', label: 'Usuarios', icon: '👥', adminOnly: true },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout() {
    this.authService.logout();
  }
}
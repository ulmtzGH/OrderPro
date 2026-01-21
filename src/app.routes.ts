import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }
  
  // FIX: Return a UrlTree for redirection, which is the correct pattern for a CanActivateFn guard.
  return router.createUrlTree(['/login']);
};

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent),
  },
  {
    path: 'new-order',
    canActivate: [authGuard],
    loadComponent: () => import('./components/new-order/new-order.component').then(m => m.NewOrderComponent),
  },
  {
    path: 'menu-management',
    canActivate: [authGuard],
    loadComponent: () => import('./components/menu-management/menu-management.component').then(m => m.MenuManagementComponent),
  },
  {
    path: 'user-management',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
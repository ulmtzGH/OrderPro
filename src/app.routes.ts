import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }
  
  // Return a UrlTree for redirection
  return router.createUrlTree(['/login']);
};

const dashboardGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Customers are not allowed in dashboard
  if (user.role === 'Customer') {
    return router.createUrlTree(['/new-order']);
  }
  
  return true;
};

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [dashboardGuard],
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
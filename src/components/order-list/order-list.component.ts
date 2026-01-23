import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';
import { OrderStatusBadgeComponent } from '../shared/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, OrderStatusBadgeComponent],
  templateUrl: './order-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  
  orders = this.orderService.orders;
  currentUser = this.authService.currentUser;
  
  filterStatus = signal<OrderStatus | 'All'>('All');
  searchFilter = signal<string>('');
  
  readonly statuses: (OrderStatus | 'All')[] = ['All', 'Pendiente', 'En Preparación', 'Listo para servir', 'Entregado', 'Pagado', 'Cancelado'];

  filteredOrders = computed(() => {
    const user = this.currentUser();
    const status = this.filterStatus();
    const search = this.searchFilter().toLowerCase().trim();
    let orders = this.orders();

    // Customer restriction: only see own orders
    if (user && user.role === 'Customer') {
        orders = orders.filter(o => o.customerId === user.id);
    }

    if (status !== 'All') {
      orders = orders.filter(order => order.status === status);
    }

    if (!search) {
      return orders;
    }

    return orders.filter(order => {
      const orderIdMatch = String(order.id).includes(search);
      if (order.isTakeaway) {
        return order.customerName?.toLowerCase().includes(search) || orderIdMatch;
      } else {
        return String(order.tableNumber).includes(search) || orderIdMatch;
      }
    });
  });

  // Computed to check if user can edit orders
  canManageOrders = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'Waiter';
  });

  setFilter(status: OrderStatus | 'All') {
    this.filterStatus.set(status);
  }

  updateSearchFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchFilter.set(target.value);
  }

  clearSearchFilter() {
    this.searchFilter.set('');
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe();
  }
  
  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['Pendiente', 'En Preparación', 'Listo para servir', 'Entregado', 'Pagado'];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex > -1 && currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  }
}
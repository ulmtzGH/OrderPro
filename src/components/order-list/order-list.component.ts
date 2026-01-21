import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
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
  
  orders = this.orderService.orders;
  filterStatus = signal<OrderStatus | 'All'>('All');
  searchFilter = signal<string>('');
  
  readonly statuses: (OrderStatus | 'All')[] = ['All', 'Pendiente', 'En Preparación', 'Listo para servir', 'Entregado', 'Pagado', 'Cancelado'];

  filteredOrders = computed(() => {
    const status = this.filterStatus();
    const search = this.searchFilter().toLowerCase().trim();
    let orders = this.orders();

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
    this.orderService.updateOrderStatus(order.id, newStatus);
  }
  
  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['Pendiente', 'En Preparación', 'Listo para servir', 'Entregado', 'Pagado'];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex > -1 && currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  }
}
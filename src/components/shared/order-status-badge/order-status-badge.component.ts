import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-status-badge',
  imports: [CommonModule],
  templateUrl: './order-status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBadgeComponent {
  status = input.required<OrderStatus>();

  badgeClasses = computed(() => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
    switch (this.status()) {
      case 'Pendiente':
        return `${base} bg-yellow-500/20 text-yellow-300`;
      case 'En Preparación':
        return `${base} bg-blue-500/20 text-blue-300`;
      case 'Listo para servir':
        return `${base} bg-purple-500/20 text-purple-300`;
      case 'Entregado':
        return `${base} bg-green-500/20 text-green-300`;
      case 'Pagado':
        return `${base} bg-teal-500/20 text-teal-300`;
      case 'Cancelado':
        return `${base} bg-red-500/20 text-red-300`;
      default:
        return `${base} bg-slate-600 text-slate-200`;
    }
  });
}

import { Injectable, signal } from '@angular/core';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { of, Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  
  // Initial Mock Data - Prices in Pesos, Tax removed from logic
  private initialOrders: Order[] = [
    { 
      id: 101, 
      tableNumber: 3, 
      isTakeaway: false, 
      items: [{ product: { id: 5, name: "Salmón a la Parrilla", description: "", category: "Platos Principales", price: 320.00, imageUrl: "https://picsum.photos/id/1060/400/300", active: true }, quantity: 2 }], 
      subtotal: 640.00, 
      total: 640.00, 
      status: "Pagado", 
      createdAt: new Date("2024-07-21T18:30:00.000Z") 
    },
    { 
      id: 102, 
      tableNumber: 5, 
      isTakeaway: false, 
      items: [
        { product: { id: 7, name: "Risotto de Champiñones", description: "", category: "Platos Principales", price: 210.00, imageUrl: "https://picsum.photos/id/1080/400/300", active: true }, quantity: 1 }, 
        { product: { id: 12, name: "Copa de Vino (Tinto/Blanco)", description: "", category: "Bebidas", price: 140.00, imageUrl: "https://picsum.photos/id/1056/400/300", active: true }, quantity: 2 }
      ], 
      subtotal: 490.00, 
      total: 490.00, 
      status: "Listo para servir", 
      createdAt: new Date("2024-07-21T19:30:00.000Z") 
    },
    { 
      id: 103, 
      tableNumber: null, 
      isTakeaway: true, 
      customerName: "Ana García", 
      items: [{ product: { id: 2, name: "Calamares Fritos", description: "", category: "Entradas", price: 180.00, imageUrl: "https://picsum.photos/id/312/400/300", active: true }, quantity: 1, comments: "Extra limón por favor" }], 
      subtotal: 180.00, 
      total: 180.00, 
      status: "En Preparación", 
      createdAt: new Date("2024-07-21T20:00:00.000Z") 
    },
    { 
      id: 104, 
      tableNumber: 8, 
      isTakeaway: false, 
      items: [
        { product: { id: 6, name: "Filete Mignon", description: "", category: "Platos Principales", price: 450.00, imageUrl: "https://picsum.photos/id/606/400/300", active: true }, quantity: 2 }, 
        { product: { id: 9, name: "Tiramisú Clásico", description: "", category: "Postres", price: 110.00, imageUrl: "https://picsum.photos/id/219/400/300", active: true }, quantity: 1 }
      ], 
      subtotal: 1010.00, 
      total: 1010.00, 
      status: "Pendiente", 
      createdAt: new Date("2024-07-21T20:25:00.000Z") 
    }
  ];

  private ordersSignal = signal<Order[]>(this.initialOrders);
  orders = this.ordersSignal.asReadonly();

  createOrder(items: OrderItem[], tableNumber: number | null, isTakeaway: boolean, customerName?: string, customerId?: number): Observable<Order> {
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    // Tax removed: Total is now equal to subtotal
    const total = subtotal;

    const newOrder: Order = {
      id: Math.max(...this.orders().map(o => o.id), 100) + 1,
      items,
      subtotal,
      total,
      status: 'Pendiente',
      createdAt: new Date(),
      tableNumber: isTakeaway ? null : tableNumber,
      isTakeaway,
      customerName: isTakeaway ? customerName : undefined,
      customerId
    };

    return of(newOrder).pipe(
      delay(500),
      tap(order => this.ordersSignal.update(orders => [order, ...orders]))
    );
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<void> {
    return of(undefined).pipe(
      delay(300),
      tap(() => this.ordersSignal.update(orders => 
        orders.map(o => o.id === orderId ? { ...o, status } : o)
      ))
    );
  }
}
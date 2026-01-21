import { Injectable, signal } from '@angular/core';
import { Order, OrderItem, OrderStatus } from '../models/order.model';

const MOCK_ORDERS: Order[] = [
  { id: 101, tableNumber: 3, isTakeaway: false, items: [{ product: { id: 5, name: 'Salmón a la Parrilla', description: '', category: 'Platos Principales', price: 24.00, imageUrl: 'https://picsum.photos/id/1060/400/300', active: true }, quantity: 2 }], subtotal: 48.00, tax: 7.68, total: 55.68, status: 'Pagado', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 102, tableNumber: 5, isTakeaway: false, items: [{ product: { id: 7, name: 'Risotto de Champiñones', description: '', category: 'Platos Principales', price: 19.00, imageUrl: 'https://picsum.photos/id/1080/400/300', active: true }, quantity: 1 }, { product: { id: 12, name: 'Copa de Vino (Tinto/Blanco)', description: '', category: 'Bebidas', price: 9.00, imageUrl: 'https://picsum.photos/id/1056/400/300', active: true }, quantity: 2 }], subtotal: 37.00, tax: 5.92, total: 42.92, status: 'Listo para servir', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: 103, tableNumber: null, isTakeaway: true, customerName: 'Ana García', items: [{ product: { id: 2, name: 'Calamares Fritos', description: '', category: 'Entradas', price: 12.00, imageUrl: 'https://picsum.photos/id/312/400/300', active: true }, quantity: 1, comments: "Extra limón por favor" }], subtotal: 12.00, tax: 1.92, total: 13.92, status: 'En Preparación', createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  { id: 104, tableNumber: 8, isTakeaway: false, items: [{ product: { id: 6, name: 'Filete Mignon', description: '', category: 'Platos Principales', price: 35.00, imageUrl: 'https://picsum.photos/id/606/400/300', active: true }, quantity: 2 }, { product: { id: 9, name: 'Tiramisú Clásico', description: '', category: 'Postres', price: 9.00, imageUrl: 'https://picsum.photos/id/219/400/300', active: true }, quantity: 1 }], subtotal: 79.00, tax: 12.64, total: 91.64, status: 'Pendiente', createdAt: new Date(Date.now() - 5 * 60 * 1000) },
];

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private ordersSignal = signal<Order[]>(MOCK_ORDERS);
  orders = this.ordersSignal.asReadonly();
  
  private taxRate = 0.16; // 16%

  createOrder(items: OrderItem[], tableNumber: number | null, isTakeaway: boolean, customerName?: string) {
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    
    const newOrder: Order = {
      id: Math.floor(Math.random() * 1000) + 200,
      tableNumber: isTakeaway ? null : tableNumber,
      isTakeaway,
      customerName: isTakeaway ? customerName : undefined,
      items,
      subtotal,
      tax,
      total,
      status: 'Pendiente',
      createdAt: new Date(),
    };

    this.ordersSignal.update(orders => [newOrder, ...orders]);
  }

  updateOrderStatus(orderId: number, status: OrderStatus) {
    this.ordersSignal.update(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }
}
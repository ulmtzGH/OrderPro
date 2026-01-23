import { Product } from './product.model';

export type OrderStatus = 'Pendiente' | 'En Preparación' | 'Listo para servir' | 'Entregado' | 'Cancelado' | 'Pagado';

export interface OrderItem {
  product: Product;
  quantity: number;
  comments?: string;
}

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  subtotal: number;
  // tax property removed
  status: OrderStatus;
  createdAt: Date;
  tableNumber: number | null;
  isTakeaway: boolean;
  customerName?: string;
  customerId?: number; // Link to a registered user
}
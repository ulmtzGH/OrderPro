import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { of, Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  
  // Initial Mock Data - Prices updated to approximate MXN
  private initialProducts: Product[] = [
    { id: 1, name: "Bruschetta de Tomate y Albahaca", description: "Pan tostado con tomates frescos, albahaca, ajo y aceite de oliva.", category: "Entradas", price: 120, imageUrl: "https://picsum.photos/id/292/400/300", active: true },
    { id: 2, name: "Calamares Fritos", description: "Calamares tiernos rebozados y fritos, servidos con alioli de limón.", category: "Entradas", price: 180, imageUrl: "https://picsum.photos/id/312/400/300", active: true },
    { id: 3, name: "Tabla de Quesos y Embutidos", description: "Selección de quesos y embutidos artesanales con pan y mermelada.", category: "Entradas", price: 250, imageUrl: "https://picsum.photos/id/326/400/300", active: true },
    { id: 4, name: "Empanadas de Carne", description: "Empanadas caseras rellenas de carne sazonada.", category: "Entradas", price: 65, imageUrl: "https://picsum.photos/id/431/400/300", active: false },
    { id: 5, name: "Salmón a la Parrilla", description: "Filete de salmón fresco a la parrilla servido con espárragos.", category: "Platos Principales", price: 320, imageUrl: "https://picsum.photos/id/1060/400/300", active: true },
    { id: 6, name: "Filete Mignon", description: "Tierno filete mignon con puré de papas trufado y reducción de vino tinto.", category: "Platos Principales", price: 450, imageUrl: "https://picsum.photos/id/606/400/300", active: true },
    { id: 7, name: "Risotto de Champiñones", description: "Cremoso risotto con champiñones silvestres y queso parmesano.", category: "Platos Principales", price: 210, imageUrl: "https://picsum.photos/id/1080/400/300", active: true },
    { id: 8, name: "Pollo al Horno con Hierbas", description: "Medio pollo marinado en hierbas y asado a la perfección.", category: "Platos Principales", price: 195, imageUrl: "https://picsum.photos/id/202/400/300", active: true },
    { id: 9, name: "Tiramisú Clásico", description: "Capas de bizcocho de soletilla empapado en café, con crema de mascarpone.", category: "Postres", price: 110, imageUrl: "https://picsum.photos/id/219/400/300", active: true },
    { id: 10, name: "Volcán de Chocolate", description: "Pastel de chocolate tibio con un centro líquido, servido con helado de vainilla.", category: "Postres", price: 125, imageUrl: "https://picsum.photos/id/429/400/300", active: true },
    { id: 11, "name": "Agua Mineral", description: "Agua mineral sin gas o con gas.", category: "Bebidas", price: 45, imageUrl: "https://picsum.photos/id/1015/400/300", active: true },
    { id: 12, "name": "Copa de Vino (Tinto/Blanco)", description: "Selección de vinos de la casa.", category: "Bebidas", price: 140, imageUrl: "https://picsum.photos/id/1056/400/300", active: true }
  ];

  private productsSignal = signal<Product[]>(this.initialProducts);
  products = this.productsSignal.asReadonly();

  getCategories() {
    const categories = this.products().map(p => p.category);
    return [...new Set(categories)];
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct = {
      ...product,
      id: Math.max(...this.products().map(p => p.id), 0) + 1
    };
    
    return of(newProduct).pipe(
      delay(300),
      tap(p => this.productsSignal.update(products => [...products, p]))
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    return of(updatedProduct).pipe(
      delay(300),
      tap(p => this.productsSignal.update(products => 
        products.map(prod => prod.id === p.id ? p : prod)
      ))
    );
  }

  deleteProduct(productId: number): Observable<void> {
    return of(undefined).pipe(
      delay(300),
      tap(() => this.productsSignal.update(products => 
        products.filter(p => p.id !== productId)
      ))
    );
  }
}
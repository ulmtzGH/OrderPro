import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { OrderItem } from '../../models/order.model';
import { FormsModule } from '@angular/forms';

interface GroupedProducts {
  category: string;
  products: Product[];
}

@Component({
  selector: 'app-new-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOrderComponent {
  private menuService = inject(MenuService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  private allProducts = this.menuService.products;
  private allCategories = computed(() => this.menuService.getCategories());

  // Signals for filters
  nameFilter = signal<string>('');
  categoryFilter = signal<string>('All');
  editingCommentId = signal<number | null>(null);
  isMobileSummaryOpen = signal(false);

  // Computed property for unique categories to display in filter buttons
  uniqueCategories = computed(() => ['All', ...this.allCategories()]);

  private filteredProducts = computed(() => {
    const activeProducts = this.allProducts().filter(p => p.active);
    const name = this.nameFilter().toLowerCase();
    const category = this.categoryFilter();

    return activeProducts.filter(product => {
      const nameMatch = name ? product.name.toLowerCase().includes(name) : true;
      const categoryMatch = category !== 'All' ? product.category === category : true;
      return nameMatch && categoryMatch;
    });
  });

  groupedProducts = computed<GroupedProducts[]>(() => {
    const products = this.filteredProducts();
    const categoriesInFilter = [...new Set(products.map(p => p.category))];
    const orderedCategories = this.allCategories().filter(c => categoriesInFilter.includes(c));

    return orderedCategories.map(category => ({
      category,
      products: products.filter(p => p.category === category),
    }));
  });

  currentOrder = signal<Map<number, OrderItem>>(new Map());
  tableNumber = signal<number | null>(null);
  isTakeaway = signal(false);
  customerName = signal('');

  orderItems = computed(() => Array.from(this.currentOrder().values()));
  
  isOrderReady = computed(() => {
    if (this.orderItems().length === 0) return false;
    if (this.isTakeaway()) {
      return this.customerName().trim().length > 0;
    }
    return !!this.tableNumber();
  });

  orderSummary = computed(() => {
    const items = this.orderItems();
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  });

  updateNameFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.nameFilter.set(target.value);
  }

  clearNameFilter() {
    this.nameFilter.set('');
  }

  setCategoryFilter(category: string) {
    this.categoryFilter.set(category);
  }
  
  toggleTakeaway() {
    this.isTakeaway.update(value => !value);
    if (this.isTakeaway()) {
      this.tableNumber.set(null);
    } else {
      this.customerName.set('');
    }
  }

  openMobileSummary() {
    this.isMobileSummaryOpen.set(true);
  }

  closeMobileSummary() {
    this.isMobileSummaryOpen.set(false);
  }

  toggleCommentEditor(productId: number) {
    this.editingCommentId.update(currentId => currentId === productId ? null : productId);
  }

  updateComment(productId: number, event: Event) {
    const comments = (event.target as HTMLTextAreaElement).value;
    this.currentOrder.update(order => {
      const item = order.get(productId);
      if (item) {
        // Set to undefined if comments are empty, otherwise trim.
        item.comments = comments.trim() ? comments.trim() : undefined;
      }
      return new Map(order);
    });
  }

  addToOrder(product: Product) {
    this.currentOrder.update(order => {
      const existingItem = order.get(product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        order.set(product.id, { product, quantity: 1 });
      }
      return new Map(order);
    });
  }

  updateQuantity(productId: number, change: number) {
    this.currentOrder.update(order => {
      const item = order.get(productId);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
          order.delete(productId);
        }
      }
      return new Map(order);
    });
  }
  
  placeOrder() {
    if (!this.isOrderReady()) {
        alert('Por favor, añade productos y especifica un número de mesa o el nombre del cliente para llevar.');
        return;
    }
    this.orderService.createOrder(this.orderItems(), this.tableNumber(), this.isTakeaway(), this.customerName());
    this.router.navigate(['/orders']);
  }
}
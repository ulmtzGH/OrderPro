import { ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-menu-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent {
  private menuService = inject(MenuService);
  // FIX: Explicitly typing FormBuilder to resolve a type inference issue with inject().
  private fb: FormBuilder = inject(FormBuilder);

  private products = this.menuService.products;
  isModalOpen = signal(false);
  editingProduct: WritableSignal<Product | null> = signal(null);
  productToDelete = signal<Product | null>(null);
  
  predefinedCategories = ['Entradas', 'Platos Principales', 'Postres', 'Bebidas', 'Sopas', 'Ensaladas'];
  productForm: FormGroup;

  // Signals for filters
  nameFilter = signal<string>('');
  categoryFilter = signal<string>('All');

  // Computed property for unique categories to display in filter buttons
  uniqueCategories = computed(() => ['All', ...this.menuService.getCategories()]);

  // Computed property to filter products based on name and category
  filteredProducts = computed(() => {
    const allProducts = this.products();
    const name = this.nameFilter().toLowerCase();
    const category = this.categoryFilter();

    return allProducts.filter(product => {
      const nameMatch = name ? product.name.toLowerCase().includes(name) : true;
      const categoryMatch = category !== 'All' ? product.category === category : true;
      return nameMatch && categoryMatch;
    });
  });

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      active: [true, Validators.required],
      imageUrl: ['https://picsum.photos/400/300', Validators.required]
    });
  }
  
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

  openModal(product: Product | null = null) {
    this.editingProduct.set(product);
    if (product) {
      this.productForm.patchValue(product);
    } else {
      this.productForm.reset({
        active: true,
        price: 0,
        category: '',
        imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.value;
    if (this.editingProduct()) {
      this.menuService.updateProduct({ ...this.editingProduct()!, ...formValue }).subscribe();
    } else {
      this.menuService.addProduct(formValue).subscribe();
    }
    this.closeModal();
  }

  requestDelete(product: Product) {
    this.productToDelete.set(product);
  }

  cancelDelete() {
    this.productToDelete.set(null);
  }

  confirmDelete() {
    const product = this.productToDelete();
    if (product) {
      this.menuService.deleteProduct(product.id).subscribe();
      this.productToDelete.set(null);
    }
  }
}

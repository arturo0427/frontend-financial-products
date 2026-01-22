import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { mapHttpErrorToUi } from '../../../../core/helpers/http-error.helper';
import { FinancialProduct } from '../../../../core/interfaces/financial-product.interface';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';
import { ProductsService } from '../../../../core/services/products.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ConfirmDeleteModalComponent } from './../../../../shared/components/modals/confirm-delete-modal/confirm-delete-modal.component';

type PageSizeOption = 5 | 10 | 20;

@Component({
  selector: 'app-products-list',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableComponent,
    ConfirmDeleteModalComponent,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  private readonly _productsService = inject(ProductsService);
  private readonly _router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<UiHttpError | null>(null);

  readonly products = signal<FinancialProduct[]>([]);

  readonly searchTerm = signal<string>('');
  readonly pageSize = signal<PageSizeOption>(5);
  readonly currentPage = signal<number>(1);

  readonly filteredProducts = computed<FinancialProduct[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.products();

    if (!term) return items;

    return items.filter((p) => {
      const haystack = `${p.id} ${p.name} ${p.description}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  readonly totalPages = computed<number>(() => {
    const total = Math.ceil(this.filteredProducts().length / this.pageSize());
    return Math.max(1, total);
  });

  readonly visibleProducts = computed<FinancialProduct[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  readonly totalFilteredCount = computed<number>(
    () => this.filteredProducts().length,
  );

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly pageSizeControl = new FormControl<PageSizeOption>(5, {
    nonNullable: true,
  });

  readonly isDeleteOpen = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly selectedToDelete = signal<FinancialProduct | null>(null);

  constructor() {
    effect(
      () => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (current > total) {
          this.currentPage.set(total);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchTerm.set(value);
        this.currentPage.set(1);
      });

    this.pageSizeControl.valueChanges.subscribe((value) => {
      this.pageSize.set(value);
      this.currentPage.set(1);
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this._productsService.getAll().subscribe({
      next: (items) => {
        this.products.set(items);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(mapHttpErrorToUi(err));
        this.isLoading.set(false);
      },
    });
  }

  goToCreate(): void {
    this._router.navigate(['/products/new']);
  }

  onEdit(productId: string): void {
    const product = this.products().find((p) => p.id === productId);
    this._router.navigate(['/products', productId, 'edit'], {
      state: product ? { product } : undefined,
    });
  }

  onDelete(productId: string): void {
    const product = this.products().find((p) => p.id === productId) ?? null;
    this.selectedToDelete.set(product);
    this.isDeleteOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) return;
    this.isDeleteOpen.set(false);
    this.selectedToDelete.set(null);
  }

  confirmDelete(): void {
    const product = this.selectedToDelete();
    if (!product) return;

    this.isDeleting.set(true);

    this._productsService.remove(product.id).subscribe({
      next: () => {
        this.products.set(this.products().filter((p) => p.id !== product.id));

        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err: unknown) => {
        this.error.set(mapHttpErrorToUi(err));
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
    });
  }

  nextPage(): void {
    const next = this.currentPage() + 1;
    if (next <= this.totalPages()) {
      this.currentPage.set(next);
    }
  }

  prevPage(): void {
    const prev = this.currentPage() - 1;
    if (prev >= 1) {
      this.currentPage.set(prev);
    }
  }
}

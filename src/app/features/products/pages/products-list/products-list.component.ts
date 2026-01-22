import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { mapHttpErrorToUi } from '../../../../core/helpers/http-error.helper';
import { FinancialProduct } from '../../../../core/interfaces/financial-product.interface';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';
import { ProductsService } from '../../../../core/services/products.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

type PageSizeOption = 5 | 10 | 20;

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TableComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent {
  private readonly _productsService = inject(ProductsService);
  private readonly _router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<UiHttpError | null>(null);

  readonly products = signal<FinancialProduct[]>([]);

  readonly searchTerm = signal<string>('');
  readonly pageSize = signal<PageSizeOption>(5);

  readonly filteredProducts = computed<FinancialProduct[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.products();

    if (!term) return items;

    return items.filter((p) => {
      const haystack = `${p.id} ${p.name} ${p.description}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  readonly visibleProducts = computed<FinancialProduct[]>(() => {
    return this.filteredProducts().slice(0, this.pageSize());
  });

  readonly totalFilteredCount = computed<number>(
    () => this.filteredProducts().length,
  );

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly pageSizeControl = new FormControl<PageSizeOption>(5, {
    nonNullable: true,
  });

  ngOnInit(): void {
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchTerm.set(value);
      });

    this.pageSizeControl.valueChanges.subscribe((value) => {
      this.pageSize.set(value);
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
    this._router.navigate(['/products', productId, 'edit']);
  }

  onDelete(productId: string): void {
    // aquí irá el modal D4
    // por ahora dejamos el hook preparado
    console.log('delete', productId);
  }
}

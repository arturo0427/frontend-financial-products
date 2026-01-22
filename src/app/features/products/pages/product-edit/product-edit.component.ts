import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { mapHttpErrorToUi } from '../../../../core/helpers/http-error.helper';
import {
  addOneYearIso,
  releaseDateNotPastValidator,
  revisionOneYearAfterValidator,
} from '../../../../core/helpers/product-form-validators';
import { FinancialProduct } from '../../../../core/interfaces/financial-product.interface';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';
import { UpdateFinancialProductPayload } from '../../../../core/interfaces/products-payloads.interface';
import { ProductsService } from '../../../../core/services/products.service';
import { ProductFormComponent } from '../../../../shared/components/forms/product-form/product-form.component';

@Component({
  selector: 'app-product-edit',
  imports: [RouterModule, ProductFormComponent],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss',
})
export class ProductEditComponent {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _productsService = inject(ProductsService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly isSaving = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<UiHttpError | null>(null);

  private _productId: string | null = null;
  private _initialValue: UpdateFinancialProductPayload | null = null;

  readonly form = new FormGroup({
    id: new FormControl<string>(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      },
    ),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
    }),
    logo: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    date_release: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, releaseDateNotPastValidator],
    }),
    date_revision: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, revisionOneYearAfterValidator],
    }),
  });

  private readonly _formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  readonly canSubmit = computed<boolean>(
    () =>
      this._formStatus() === 'VALID' && !this.isSaving() && !this.isLoading(),
  );

  ngOnInit(): void {
    this.form.disable({ emitEvent: false });

    this._productId = this._route.snapshot.paramMap.get('id');
    if (!this._productId) {
      this._router.navigate(['/products']);
      return;
    }

    const stateProduct = history.state?.product as FinancialProduct | undefined;
    if (stateProduct && stateProduct.id === this._productId) {
      this.applyProduct(stateProduct);
      this.form.enable({ emitEvent: false });
      this.form.controls.id.disable({ emitEvent: false });
      this.isLoading.set(false);
    } else {
      this.loadProduct(this._productId);
    }

    this.form.controls.date_release.valueChanges
      .pipe(
        debounceTime(0),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((release: any) => {
        const nextRevision = release ? addOneYearIso(release) : '';
        this.form.controls.date_revision.setValue(nextRevision, {
          emitEvent: false,
        });
        this.form.controls.date_revision.updateValueAndValidity({
          emitEvent: false,
        });
      });

    this.form.controls.date_revision.valueChanges
      .pipe(
        debounceTime(0),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.form.controls.date_revision.updateValueAndValidity({
          emitEvent: false,
        });
      });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this._productId) return;

    this.isSaving.set(true);
    this.error.set(null);

    const payload: UpdateFinancialProductPayload = {
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim(),
      logo: this.form.controls.logo.value.trim(),
      date_release: this.form.controls.date_release.value,
      date_revision: this.form.controls.date_revision.value,
    };

    this._productsService.update(this._productId, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this._router.navigate(['/products']);
      },
      error: (err: unknown) => {
        this.error.set(mapHttpErrorToUi(err));
        this.isSaving.set(false);
      },
    });
  }

  reset(): void {
    if (!this._initialValue) return;
    this.error.set(null);
    this.form.reset({
      id: this._productId ?? '',
      ...this._initialValue,
    });
    this.form.controls.id.disable({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  cancel(): void {
    this._router.navigate(['/products']);
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.form.disable({ emitEvent: false });

    this._productsService.getById(id).subscribe({
      next: (product) => {
        this.applyProduct(product);
        this.form.enable({ emitEvent: false });
        this.form.controls.id.disable({ emitEvent: false });
        this.form.controls.date_revision.updateValueAndValidity({
          emitEvent: false,
        });
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(mapHttpErrorToUi(err));
        this.isLoading.set(false);
      },
    });
  }

  private applyProduct(product: FinancialProduct): void {
    this._initialValue = {
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    };
    this.form.reset({
      id: product.id,
      ...this._initialValue,
    });
    this.form.controls.id.disable({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
    this.form.controls.date_revision.updateValueAndValidity({
      emitEvent: false,
    });
  }
}


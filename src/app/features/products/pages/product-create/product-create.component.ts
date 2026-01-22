import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, distinctUntilChanged, first, map, of } from 'rxjs';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { mapHttpErrorToUi } from '../../../../core/helpers/http-error.helper';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';
import { CreateFinancialProductPayload } from '../../../../core/interfaces/products-payloads.interface';
import { ProductsService } from '../../../../core/services/products.service';
import { ProductFormComponent } from '../../../../shared/components/forms/product-form/product-form.component';
import {
  addOneYearIso,
  releaseDateNotPastValidator,
  revisionOneYearAfterValidator,
} from '../../../../core/helpers/product-form-validators';

type ProductCreateForm = FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  logo: FormControl<string>;
  date_release: FormControl<string>;
  date_revision: FormControl<string>;
}>;

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [RouterModule, ProductFormComponent],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
})
export class ProductCreateComponent {
  private readonly _productsService = inject(ProductsService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  readonly isSaving = signal<boolean>(false);
  readonly error = signal<UiHttpError | null>(null);

  readonly form: ProductCreateForm = new FormGroup(
    {
      id: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        asyncValidators: [this.uniqueIdValidator.bind(this)],
        updateOn: 'blur',
      }),
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
        validators: [
          Validators.required,
          releaseDateNotPastValidator,
        ],
      }),
      date_revision: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, revisionOneYearAfterValidator],
      }),
    },
  );

  private readonly _formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  readonly canSubmit = computed<boolean>(() => {
    return this._formStatus() === 'VALID' && !this.isSaving();
  });

  ngOnInit(): void {
    this.form.controls.date_release.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe((release: string) => {
        const nextRevision = release ? addOneYearIso(release) : '';

        this.form.controls.date_revision.setValue(nextRevision, {
          emitEvent: false,
        });

        this.form.controls.date_revision.updateValueAndValidity({
          emitEvent: true,
        });
      });
  }

  private uniqueIdValidator(control: AbstractControl<string>) {
    const id = (control.value ?? '').trim();
    if (!id || id.length < 3) return of(null);

    return this._productsService.verifyIdExists(id).pipe(
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of(null)),
      first(),
    );
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.error.set(null);

    const payload: CreateFinancialProductPayload = {
      id: this.form.controls.id.value.trim(),
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim(),
      logo: this.form.controls.logo.value.trim(),
      date_release: this.form.controls.date_release.value,
      date_revision: this.form.controls.date_revision.value,
    };

    this._productsService.create(payload).subscribe({
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
    this.error.set(null);
    this.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
    this.form.updateValueAndValidity({ emitEvent: true });
  }

  cancel(): void {
    this._router.navigate(['/products']);
  }

}

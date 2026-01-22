import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FinancialProduct } from '../../../../core/interfaces/financial-product.interface';
import { ProductsService } from '../../../../core/services/products.service';
import { ProductCreateComponent } from './product-create.component';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';

describe('ProductCreateComponent', () => {
  let fixture: ComponentFixture<ProductCreateComponent>;
  let component: ProductCreateComponent;

  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const productsSpy = jasmine.createSpyObj<ProductsService>('ProductsService', [
    'verifyIdExists',
    'create',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreateComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ProductsService, useValue: productsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;

    productsSpy.verifyIdExists.and.returnValue(of(false));
    fixture.detectChanges();
  });

  afterEach(() => {
    routerSpy.navigate.calls.reset();
    productsSpy.verifyIdExists.calls.reset();
    productsSpy.create.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set date_revision to +1 year when date_release changes', fakeAsync(() => {
    component.form.controls.date_release.setValue('2026-01-22');
    tick(); // por valueChanges

    expect(component.form.controls.date_revision.value).toBe('2027-01-22');
  }));

  it('should mark id as taken when verifyIdExists returns true', fakeAsync(() => {
    productsSpy.verifyIdExists.and.returnValue(of(true));

    const idCtrl = component.form.controls.id;
    idCtrl.setValue('abc'); // >= 3
    idCtrl.markAsTouched();
    idCtrl.updateValueAndValidity(); // updateOn blur -> simulamos blur:
    idCtrl.markAsPending();
    idCtrl.updateValueAndValidity();

    // Para disparar async validator con updateOn blur, forzamos "blur" en el input real:
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#id');
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));

    tick(); // resuelve first()

    expect(idCtrl.errors?.['idTaken']).toBeTrue();
  }));

  it('should submit when form is valid, call create and navigate', () => {
    const created: FinancialProduct = {
      id: 'prd-001',
      name: 'Producto Nombre',
      description: 'Descripción suficientemente larga',
      logo: 'https://test.com/logo.png',
      date_release: '2026-01-22',
      date_revision: '2027-01-22',
    };

    productsSpy.create.and.returnValue(of(created));

    component.form.setValue({
      id: 'prd-001',
      name: 'Producto Nombre',
      description: 'Descripción suficientemente larga',
      logo: 'https://test.com/logo.png',
      date_release: '2026-01-22',
      date_revision: '2027-01-22',
    });

    component.submit();

    expect(productsSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.isSaving()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should not submit when form is invalid', () => {
    component.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });

    component.submit();

    expect(productsSpy.create).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set error when create fails', () => {
    productsSpy.create.and.returnValue(
      throwError(() => ({ status: 500, error: { message: 'Server error' } })),
    );

    component.form.setValue({
      id: 'prd-001',
      name: 'Producto Nombre',
      description: 'Descripción suficientemente larga',
      logo: 'https://test.com/logo.png',
      date_release: '2026-01-22',
      date_revision: '2027-01-22',
    });

    component.submit();

    expect(component.isSaving()).toBeFalse();
    expect(component.error()).not.toBeNull();
  });

  it('should reset form and clear error', () => {
    const uiError: UiHttpError = { statusCode: 500, message: 'Boom' };
    component.error.set(uiError);

    component.form.setValue({
      id: 'prd-001',
      name: 'Producto Nombre',
      description: 'Descripción suficientemente larga',
      logo: 'https://test.com/logo.png',
      date_release: '2026-01-22',
      date_revision: '2027-01-22',
    });

    component.reset();

    expect(component.error()).toBeNull();
    expect(component.form.controls.id.value).toBe('');
    expect(component.form.controls.name.value).toBe('');
  });

  it('should navigate to /products on cancel', () => {
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});

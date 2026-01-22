import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductEditComponent } from './product-edit.component';
import { ProductsService } from '../../../../core/services/products.service';
import { FinancialProduct } from '../../../../core/interfaces/financial-product.interface';

describe('ProductEditComponent', () => {
  let fixture: ComponentFixture<ProductEditComponent>;
  let component: ProductEditComponent;

  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const productsSpy = jasmine.createSpyObj<ProductsService>('ProductsService', [
    'getById',
    'update',
  ]);

  const makeRoute = (id: string | null) =>
    ({
      snapshot: {
        paramMap: {
          get: (_key: string) => id,
        },
      },
    }) as unknown as ActivatedRoute;

  const productMock: FinancialProduct = {
    id: 'prd-001',
    name: 'Producto Nombre',
    description: 'Descripción suficientemente larga',
    logo: 'https://test.com/logo.png',
    date_release: '2026-01-22',
    date_revision: '2027-01-22',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEditComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ProductsService, useValue: productsSpy },
        { provide: ActivatedRoute, useValue: makeRoute('prd-001') },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    routerSpy.navigate.calls.reset();
    productsSpy.getById.calls.reset();
    productsSpy.update.calls.reset();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    productsSpy.getById.and.returnValue(of(productMock));
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should navigate away if no id param', () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: makeRoute(null) });

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should use history.state.product when matches id and not call getById', () => {
    const originalState = history.state;

    try {
      // Simula state
      history.replaceState({ product: productMock }, '');

      fixture = TestBed.createComponent(ProductEditComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(productsSpy.getById).not.toHaveBeenCalled();
      expect(component.isLoading()).toBeFalse();
      expect(component.form.controls.name.value).toBe(productMock.name);
      expect(component.form.controls.id.disabled).toBeTrue();
    } finally {
      history.replaceState(originalState, '');
    }
  });

  it('should call getById when no state product', () => {
    productsSpy.getById.and.returnValue(of(productMock));

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(productsSpy.getById).toHaveBeenCalledWith('prd-001');
    expect(component.isLoading()).toBeFalse();
    expect(component.form.controls.name.value).toBe(productMock.name);
    expect(component.form.controls.id.disabled).toBeTrue();
  });

  it('should submit valid form and call update then navigate', () => {
    productsSpy.getById.and.returnValue(of(productMock));
    productsSpy.update.and.returnValue(of(productMock));

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.form.controls.name.setValue('Nuevo Nombre');
    component.form.controls.description.setValue(
      'Descripción suficientemente larga',
    );
    component.form.controls.logo.setValue('https://test.com/logo.png');
    component.form.controls.date_release.setValue('2026-01-22');
    component.form.controls.date_revision.setValue('2027-01-22');

    component.submit();

    expect(productsSpy.update).toHaveBeenCalledWith(
      'prd-001',
      jasmine.objectContaining({
        name: 'Nuevo Nombre',
      }),
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.isSaving()).toBeFalse();
  });

  it('should set error when update fails', () => {
    productsSpy.getById.and.returnValue(of(productMock));
    productsSpy.update.and.returnValue(
      throwError(() => ({ status: 500, error: { message: 'Server error' } })),
    );

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.form.controls.name.setValue('Nuevo Nombre');
    component.form.controls.description.setValue(
      'Descripción suficientemente larga',
    );
    component.form.controls.logo.setValue('https://test.com/logo.png');
    component.form.controls.date_release.setValue('2026-01-22');
    component.form.controls.date_revision.setValue('2027-01-22');

    component.submit();

    expect(component.error()).not.toBeNull();
    expect(component.isSaving()).toBeFalse();
  });

  it('should reset to initial values', () => {
    productsSpy.getById.and.returnValue(of(productMock));

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.form.controls.name.setValue('Cambiado');
    component.reset();

    expect(component.form.controls.name.value).toBe(productMock.name);
    expect(component.form.controls.id.disabled).toBeTrue();
  });

  it('should navigate to /products on cancel', () => {
    productsSpy.getById.and.returnValue(of(productMock));

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});

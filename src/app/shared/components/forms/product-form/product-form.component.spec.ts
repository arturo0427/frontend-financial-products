import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ProductFormComponent } from './product-form.component';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  const buildForm = (): FormGroup =>
    new FormGroup({
      id: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      logo: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      date_release: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      date_revision: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;

    component.form = buildForm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submitForm on form submit', () => {
    spyOn(component.submitForm, 'emit');

    fixture.detectChanges();

    const formEl: HTMLFormElement | null =
      fixture.nativeElement.querySelector('form');
    expect(formEl).toBeTruthy();

    formEl!.dispatchEvent(new Event('submit'));
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should emit resetForm on reset button click', () => {
    spyOn(component.resetForm, 'emit');

    fixture.detectChanges();

    const resetBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[type="button"]');
    expect(resetBtn).toBeTruthy();

    resetBtn!.click();
    expect(component.resetForm.emit).toHaveBeenCalled();
  });

  it('should disable reset button when isSaving is true', () => {
    component.isSaving = true;

    fixture.detectChanges();

    const resetBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[type="button"]');
    expect(resetBtn?.disabled).toBeTrue();
  });

  it('should disable submit button when canSubmit is false', () => {
    component.canSubmit = false;

    fixture.detectChanges();

    const submitBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn?.disabled).toBeTrue();
  });

  it('should render error block when error is provided', () => {
    const err: UiHttpError = { statusCode: 500, message: 'Boom' };
    component.error = err;

    fixture.detectChanges();

    const errorTitle = fixture.nativeElement.querySelector(
      '.state__title',
    ) as HTMLElement | null;
    const errorMsg = fixture.nativeElement.querySelector(
      '.state__message',
    ) as HTMLElement | null;

    expect(errorTitle?.textContent).toContain('Error');
    expect(errorMsg?.textContent).toContain('Boom');
  });

  it('should show ID required message when id is touched and required', () => {
    component.form.controls['id'].markAsTouched();
    component.form.controls['id'].setValue('');

    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector(
      '.field .error',
    ) as HTMLElement | null;
    expect(errorEl?.textContent).toContain('El ID es requerido.');
  });
});


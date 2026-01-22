import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UiHttpError } from '../../../../core/interfaces/http-error.interface';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isSaving = false;
  @Input() canSubmit = true;
  @Input() error: UiHttpError | null = null;
  @Input() submitLabel = 'Agregar';
  @Input() savingLabel = 'Guardando...';

  @Output() submitForm = new EventEmitter<void>();
  @Output() resetForm = new EventEmitter<void>();

  onSubmit(): void {
    this.submitForm.emit();
  }

  onReset(): void {
    this.resetForm.emit();
  }
}




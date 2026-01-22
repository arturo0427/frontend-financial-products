import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.scss',
})
export class ConfirmDeleteModalComponent {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) productName = '';
  @Input() isBusy = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdropClick(): void {
    if (this.isBusy) return;
    this.cancel.emit();
  }

  onCancel(): void {
    if (this.isBusy) return;
    this.cancel.emit();
  }

  onConfirm(): void {
    if (this.isBusy) return;
    this.confirm.emit();
  }
}



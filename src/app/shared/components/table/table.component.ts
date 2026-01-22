import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FinancialProduct } from '../../../core/interfaces/financial-product.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input({ required: true }) items: FinancialProduct[] = [];

  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  onEdit(id: string): void {
    this.edit.emit(id);
  }

  onRemove(id: string): void {
    this.remove.emit(id);
  }
}

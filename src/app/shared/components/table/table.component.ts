import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FinancialProduct } from '../../../core/interfaces/financial-product.interface';
import { CommonModule } from '@angular/common';
type MenuPosition = {
  top: number;
  left: number;
};
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

  menuOpenFor: string | null = null;
  menuPosition: MenuPosition | null = null;

  private readonly dropdownWidth = 188;
  private readonly dropdownOffset = 8;
  private readonly viewportPadding = 16;

  toggleMenu(event: MouseEvent, id: string): void {
    event.stopPropagation();
    const trigger = event.currentTarget as HTMLElement | null;

    if (!trigger) {
      return;
    }

    if (this.menuOpenFor === id) {
      this.closeMenu();
      return;
    }

    this.menuOpenFor = id;
    this.menuPosition = this.getMenuPosition(trigger);
  }

  private closeMenu(): void {
    this.menuOpenFor = null;
    this.menuPosition = null;
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  onDismiss(): void {
    this.closeMenu();
  }

  onEdit(id: string): void {
    this.closeMenu();
    this.edit.emit(id);
  }

  onRemove(id: string): void {
    this.closeMenu();
    this.remove.emit(id);
  }

  private getMenuPosition(trigger: HTMLElement): MenuPosition {
    const rect = trigger.getBoundingClientRect();
    const maxLeft =
      window.innerWidth - this.dropdownWidth - this.viewportPadding;
    const computedLeft = rect.right - this.dropdownWidth;
    const left = Math.min(
      Math.max(computedLeft, this.viewportPadding),
      Math.max(this.viewportPadding, maxLeft),
    );

    return {
      top: rect.bottom + this.dropdownOffset,
      left,
    };
  }
}



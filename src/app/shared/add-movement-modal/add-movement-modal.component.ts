import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { MovimientosService } from '../services/movimientos.service';


@Component({
  selector: 'app-add-movement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-movement-modal.component.html',
})
export class AddMovementModalComponent {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  title = '';
  amount: number | null = null;
  date =  new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  type = 'ingreso';
  category = '';
  private movementsSvc = inject(MovimientosService);

  submitForm() {
    const nuevo = {
      id: uuid(),
      title: this.title,
      amount: this.amount!,
      date: this.date,
      type: this.type as 'ingreso' | 'gasto',
      category: this.category,
    };

    this.movementsSvc.agregar(nuevo);
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.title = '';
    this.amount = null;
    this.date = '';
    this.type = 'ingreso';
    this.category = '';
  }
}

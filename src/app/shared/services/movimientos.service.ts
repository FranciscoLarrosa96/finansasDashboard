import { Injectable, signal } from '@angular/core';
import { Movimiento } from '../interfaces/movimiento.interface';


@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private _movimientos = signal<Movimiento[]>(this.getFromStorage());

  get movimientos() {
    return this._movimientos.asReadonly();
  }

  agregar(mov: Movimiento) {
    const nuevos = [mov, ...this._movimientos()];
    this._movimientos.set(nuevos);
    localStorage.setItem('movimientos', JSON.stringify(nuevos));
  }

  eliminar(id: string) {
    const filtrados = this._movimientos().filter(m => m.id !== id);
    this._movimientos.set(filtrados);
    localStorage.setItem('movimientos', JSON.stringify(filtrados));
  }


  private getFromStorage(): Movimiento[] {
    const data = localStorage.getItem('movimientos');
    return data ? JSON.parse(data) : [];
  }
}

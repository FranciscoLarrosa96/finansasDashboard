import { inject, Injectable, signal } from '@angular/core';
import { Movimiento } from '../interfaces/movimiento.interface';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private firestore = inject(Firestore);
  private movimientosRef = collection(this.firestore, 'movimientos');
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

  
  agregarMovimiento(movimiento: any) {
    return addDoc(this.movimientosRef, movimiento);
  }

  obtenerMovimientos() {
    return collectionData(this.movimientosRef, { idField: 'id' });
  }


  private getFromStorage(): Movimiento[] {
    const data = localStorage.getItem('movimientos');
    return data ? JSON.parse(data) : [];
  }
}

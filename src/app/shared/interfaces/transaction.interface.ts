export interface Transaccion {
  id?: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  fecha: any; // o Timestamp si usás Firestore directamente,
  categoria: string;
}

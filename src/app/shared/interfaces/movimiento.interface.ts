export interface Movimiento {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'ingreso' | 'gasto';
  category: string;
}

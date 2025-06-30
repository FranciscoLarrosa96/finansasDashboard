import { Component, effect, inject, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { LastTransactionCardComponent } from '../../last-transaction-card/last-transaction-card.component';
import { Transaccion } from '../../shared/interfaces/transaction.interface';
import { DashboardSvc } from '../../shared/services/dashboard.service';
import { User } from 'firebase/auth';
import { GraficoTransaccionesComponent } from '../grafico-transacciones/grafico-transacciones.component';
import { ListadoTransaccionesComponent } from '../listado-transacciones/listado-transacciones.component';
import { ModalTransaccionComponent } from '../modal-transaccion/modal-transaccion.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgxSkeletonLoaderModule, LastTransactionCardComponent, GraficoTransaccionesComponent, ListadoTransaccionesComponent, ModalTransaccionComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {


  /**
   * Load User effect and get the last transaction
   * This effect will be triggered when the component is initialized
   */
  loadUser = effect(() => {
    this.user = this.authService.user() || {} as User;
    if (this.user.uid !== undefined) {
      const uid = this.user.uid;
      this.getLastTransaction(uid);
      this.loadTotalesFinancieros(uid); // Load financial totals when user is loaded
    }
  });

  updateValues = effect(() => {
    if (this.dashboardService.refreshTransactionsComputed()) {
      this.loadTotalesFinancieros(this.user.uid);
    }
  });

  modo: 'crear' | 'editar' = 'crear'; // Modo de la transacción: 'crear' o 'editar'
  modalAbierto = false;
  user: User = {} as User;
  updateTransactions = false;
  showSkeleton = true;
  authService = inject(AuthService);
  updateTransaction: Transaccion | null = null; // Variable para almacenar la transacción a editar
  lastTransaction: Transaccion | null = null;
  ingresosTotales = 0;
  gastosTotales = 0;
  balance = 0;

  private dashboardService = inject(DashboardSvc);

  ngOnInit(): void {

  }

  /**
   * Get the last transaction for a user
   * @param uid 
   */
  getLastTransaction(uid: string) {
    this.dashboardService.getUltimaTransaccion(uid)
      .subscribe(
        {
          next: (transaction: Transaccion | null) => {
            this.lastTransaction = transaction;
            this.showSkeleton = false; // Hide skeleton loader once data is loaded
          },
          error: (error) => {
            console.error('Error al obtener la última transacción:', error);
          }
        }
      );
  }

  abrirModalCrear() {
    this.modalAbierto = true;
  }

  /**
   * Recarga el dashboard después de crear o editar una transacción, debo recargar el listado de transacciones y los gráficos
   * Cierra el modal de creación/edición
   */
  recargarDashboard() {
    this.modalAbierto = false;
    this.dashboardService.refreshTransactionsSignal.set(true); // Trigger refresh of transactions
  }

  /**
   * Edit transaction handler
   * @param event 
   */
  editTransaction(event: { transaccion: Transaccion | null }) {
    this.modo = 'editar';
    this.modalAbierto = true;
    this.updateTransaction = event.transaccion;
  }

  /**
   * Create transaction handler
   */
  createTransaction() {
    this.modo = 'crear';
    this.modalAbierto = true;
    this.updateTransaction = null;
  }

  /**
   * Carga los totales financieros del usuario
   * @returns 
   */
  loadTotalesFinancieros(uid: string) {

    this.dashboardService.getTransaccionesPorUsuario(uid).then(snapshot => {
      let ingresos = 0;
      let gastos = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const monto = data['monto'];
        const tipo = data['tipo'];

        if (tipo === 'ingreso') {
          ingresos += monto;
        } else {
          gastos += monto;
        }
      });

      this.ingresosTotales = ingresos;
      this.gastosTotales = gastos;
      this.balance = ingresos - gastos;
    });
  }

  /**
   * Get the balance information for the user
   */
  get balanceInfo() {
    if (this.balance > 0) {
      return { class: 'text-green-600 bg-green-100', emoji: '🤑' };
    } else if (this.balance < 0) {
      return { class: 'text-red-600 bg-red-100', emoji: '😵‍💫' };
    } else {
      return { class: 'text-gray-600 bg-gray-100', emoji: '😐' };
    }
  }


}

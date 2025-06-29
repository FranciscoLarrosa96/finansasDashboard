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
   * Load User effect
   */
  loadUser = effect(() => {
    this.user = this.authService.user() || {} as User;
    if (this.user.uid !== undefined) {
      const uid = this.user.uid;
      this.getLastTransaction(uid);
    }

  });
  modalAbierto = false;
  user: User = {} as User;

  authService = inject(AuthService);

  lastTransaction: Transaccion | null = null;

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

  recargarDashboard() {
    this.modalAbierto = false;
    this.dashboardService.getTransaccionesPorUsuario(this.user.uid)
      .then(transacciones => {
        console.log('Transacciones recargadas:', transacciones)
      });
  }

}

import { Component, effect, inject, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { LastTransactionCardComponent } from '../../last-transaction-card/last-transaction-card.component';
import { Transaccion } from '../../shared/interfaces/transaction.interface';
import { DashboardSvc } from '../../shared/services/dashboard.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LastTransactionCardComponent],
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

  user: User = {} as User;

  authService = inject(AuthService);

  lastTransaction: Transaccion | null = null;

  private dashboardService = inject(DashboardSvc);

  ngOnInit(): void {

  }

  getLastTransaction(uid: string) {
    this.dashboardService.getUltimaTransaccion(uid).subscribe((transaccion) => {
      this.lastTransaction = transaccion;
    });
  }


}

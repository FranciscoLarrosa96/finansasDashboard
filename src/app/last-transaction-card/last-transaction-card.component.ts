import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, Input, OnInit } from '@angular/core';
import { Transaccion } from '../shared/interfaces/transaction.interface';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { DashboardSvc } from '../shared/services/dashboard.service';

@Component({
  selector: 'app-last-transaction-card',
  templateUrl: './last-transaction-card.component.html',
  styleUrls: ['./last-transaction-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LastTransactionCardComponent implements OnInit {
  transaction = input<Transaccion | null>();

  /**
   * Load transaction effect
   */
  transactionEffect = effect(() => {
    console.log('Transaction effect triggered', this.transaction());
    
  });

  private authSvc = inject(AuthService);
  private dashboardService = inject(DashboardSvc);

  ngOnInit() {

    
  }
}

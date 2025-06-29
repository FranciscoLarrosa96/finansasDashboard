import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';
import {
  ApexChart, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexDataLabels,
  ApexStroke, ApexTitleSubtitle, ApexTooltip, ChartComponent, ApexOptions
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { DashboardSvc } from '../../shared/services/dashboard.service';
import { NgApexchartsModule } from 'ng-apexcharts';




@Component({
  selector: 'app-grafico-transacciones',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-transacciones.component.html',
  styleUrl: './grafico-transacciones.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class GraficoTransaccionesComponent implements OnInit {

  /**
   * UI change effect dettector
   * This effect will be triggered when the chartOptions changes
   */
  uiEffect = effect(() => {
    this.uid = this.auth.user()?.uid;
    this.loadTransanctions();
  });
  uid: string | undefined = undefined;
  chartBarSeries: ApexAxisChartSeries = [];
  chartBarOptions: Partial<ApexOptions & { xaxis: ApexXAxis }> = {
    chart: { type: 'bar' },
    xaxis: { categories: [] }
  };
  chartDonutSeries: ApexNonAxisChartSeries = [];
  chartDonutLabels: string[] = [];
  chartDonutOptions: Partial<ApexOptions & { labels: string[], legend: ApexLegend, responsive: ApexResponsive[] }> = {
    chart: {
      type: 'donut'
    },
    labels: [],
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }]
  };
  private auth = inject(AuthService);
  private dashboardSvc = inject(DashboardSvc);

  ngOnInit() {
  }

  /**
   * Load transactions for the user
   */
  loadTransanctions() {
    if (!this.uid) return;

    this.dashboardSvc.getTransaccionesPorUsuario(this.uid)
      .then(snapshot => {
        const mensual: Record<string, { ingreso: number; gasto: number }> = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          const fecha = data['fecha'].toDate();
          const mes = fecha.toLocaleString('default', { month: 'short' });

          if (!mensual[mes]) {
            mensual[mes] = { ingreso: 0, gasto: 0 };
          }

          if (data['tipo'] === 'ingreso') {
            mensual[mes].ingreso += data['monto'];
          } else {
            mensual[mes].gasto += data['monto'];
          }
        });
        const meses = Object.keys(mensual);
        const ingresos = meses.map(m => mensual[m].ingreso);
        const gastos = meses.map(m => mensual[m].gasto);

        this.chartBarSeries = [
          { name: 'Ingresos', data: ingresos },
          { name: 'Gastos', data: gastos }
        ];

        this.chartBarOptions = {
          chart: { type: 'bar' },
          xaxis: { categories: meses }
        };
      });
  }
}



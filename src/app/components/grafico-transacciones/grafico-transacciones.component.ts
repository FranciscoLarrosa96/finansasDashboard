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

  coloresPorCategoria: Record<string, string> = {
    Comida: '#f43f5e',         // rosa fuerte
    Transporte: '#3b82f6',     // azul
    Alquiler: '#f59e0b',       // naranja
    Entretenimiento: '#8b5cf6',// violeta
    'Sin categoría': '#6b7280' // gris
  };


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

    const categoriasGasto: Record<string, number> = {};

    this.dashboardSvc.getTransaccionesPorUsuario(this.uid)
      .then(snapshot => {
        const mensual: Record<string, { ingreso: number; gasto: number }> = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          const fecha = data['fecha'].toDate();
          const mes = fecha.toLocaleString('default', { month: 'short' });

          // Agrupar mensual para el gráfico de barras
          if (!mensual[mes]) {
            mensual[mes] = { ingreso: 0, gasto: 0 };
          }
          if (data['tipo'] === 'ingreso') {
            mensual[mes].ingreso += data['monto'];
          } else {
            mensual[mes].gasto += data['monto'];

            // Agrupar por categoría para el donut
            const categoria = data['categoria'] || 'Sin categoría';
            categoriasGasto[categoria] = (categoriasGasto[categoria] || 0) + data['monto'];
          }
        });

        // Gráfico de barras
        const meses = Object.keys(mensual);
        const ingresos = meses.map(m => mensual[m].ingreso);
        const gastos = meses.map(m => mensual[m].gasto);

        this.chartBarSeries = [
          { name: 'Ingresos', data: ingresos },
          { name: 'Gastos', data: gastos }
        ];

        this.chartBarOptions = {
          chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
          },
          plotOptions: {
            bar: {
              columnWidth: '60%',
              borderRadius: 6
            }
          },
          xaxis: {
            categories: meses
          },
          colors: ['#dd0e7c', '#6b1d68'],
          legend: {
            position: 'bottom'
          },
          dataLabels: {
            enabled: false
          },
          grid: {
            strokeDashArray: 4
          },
          tooltip: {
            enabled: true
          }
        };

        // Gráfico de donut
        const coloresPorCategoria: Record<string, string> = {
          Comida: '#dd0e7c',            // main-color
          Transporte: '#6b1d68',        // secondary-color
          Sueldo: '#c6006d',            // hover-color
          Juegos: '#fcd6e2',            // border-color
          Alquiler: '#f472b6',          // rosa suave
          Educación: '#e879f9',         // lavanda suave
          Salud: '#d946ef',             // violeta claro
          Compras: '#f9a8d4',           // rosado pastel
          'Sin categoría': '#e4e4e7'    // gris neutro
        };

        const labels = Object.keys(categoriasGasto);
        const series = Object.values(categoriasGasto);
        const colors = labels.map(cat => coloresPorCategoria[cat] || '#e4e4e7');

        this.chartDonutSeries = series;
        this.chartDonutLabels = labels;
        this.chartDonutOptions = {
          chart: { type: 'donut' },
          labels,
          colors,
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
      });
  }




}



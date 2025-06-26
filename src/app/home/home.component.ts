import { Component, computed, inject } from '@angular/core';
import { MovimientosService } from '../shared/services/movimientos.service';
import { CommonModule } from '@angular/common';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private service = inject(MovimientosService);
  movimientos = computed(() => this.service.movimientos());
  // Datos calculados
  totalIngresos = computed(() =>
    this.movimientos().filter(m => m.type === 'ingreso').reduce((a, b) => a + b.amount, 0)
  );
  totalGastos = computed(() =>
    this.movimientos().filter(m => m.type === 'gasto').reduce((a, b) => a + b.amount, 0)
  );

  chartData = computed(() => ({
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        data: [this.totalIngresos(), this.totalGastos()],
        backgroundColor: ['#16a34a', '#dc2626'], // verde / rojo
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      }
    ]
  }));

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#27272a',
        }
      },
    }
  };

  chartDataBarras = computed<ChartData<'bar'>>(() => {
    const meses = Object.keys(this.movimientosPorMes).sort();
    return {
      labels: meses.map(m => this.formatMes(m)),
      datasets: [
        {
          label: 'Ingresos',
          data: meses.map(m => this.movimientosPorMes[m].ingreso),
          backgroundColor: '#16a34a',
        },
        {
          label: 'Gastos',
          data: meses.map(m => this.movimientosPorMes[m].gasto),
          backgroundColor: '#dc2626',
        }
      ]
    };
  });

  chartOptionsBarras: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#27272a' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#27272a' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#27272a' },
      }
    }
  };

  chartType: ChartType = 'doughnut';
  chartTypeBarras = 'bar' as const;


  eliminar(id: string) {
    this.service.eliminar(id);
  }

  formatMes(fecha: string): string {
    const [year, month] = fecha.split('-');
    return `${month}/${year}`;
  }

  // Agrupamos por mes
  get movimientosPorMes() {
    const datos: { [mes: string]: { ingreso: number; gasto: number } } = {};

    this.movimientos().forEach(m => {
      const mes = m.date.slice(0, 7); // ej: "2025-06"
      if (!datos[mes]) {
        datos[mes] = { ingreso: 0, gasto: 0 };
      }
      if (m.type === 'ingreso') datos[mes].ingreso += m.amount;
      else datos[mes].gasto += m.amount;
    });

    return datos;
  }
}

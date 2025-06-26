import { Component, computed, inject, signal } from '@angular/core';
import { MovimientosService } from '../shared/services/movimientos.service';
import { CommonModule } from '@angular/common';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private service = inject(MovimientosService);
  movimientos = computed(() => this.service.movimientos());
  // Datos calculados
  totalIngresos = computed(() =>
    this.movimientosFiltrados().filter(m => m.type === 'ingreso').reduce((a, b) => a + b.amount, 0)
  );

  totalGastos = computed(() =>
    this.movimientosFiltrados().filter(m => m.type === 'gasto').reduce((a, b) => a + b.amount, 0)
  );

  selectedMes = signal('todos');
  selectedMesModel = 'todos'; // para el ngModel
  // Lista de meses únicos (ej: ["2025-06", "2025-07"])
  mesesUnicos = computed(() => {
    const meses = new Set<string>();
    this.movimientos().forEach(m => meses.add(m.date.slice(0, 7)));
    return Array.from(meses).sort();
  });

  // Movimientos filtrados por mes
  movimientosFiltrados = computed(() => {
    if (this.selectedMes() === 'todos') return this.movimientos();
    return this.movimientos().filter(m => m.date.startsWith(this.selectedMes()));
  });


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
    const datos = this.movimientosFiltrados().reduce((acc, m) => {
      const mes = m.date.slice(0, 7);
      if (!acc[mes]) acc[mes] = { ingreso: 0, gasto: 0 };
      acc[mes][m.type] += m.amount;
      return acc;
    }, {} as Record<string, { ingreso: number; gasto: number }>);

    const meses = Object.keys(datos).sort();

    return {
      labels: meses.map(m => this.formatMes(m)),
      datasets: [
        {
          label: 'Ingresos',
          data: meses.map(m => datos[m].ingreso),
          backgroundColor: '#16a34a',
        },
        {
          label: 'Gastos',
          data: meses.map(m => datos[m].gasto),
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

  setSelectedMes(value: string) {
    this.selectedMesModel = value;
    this.selectedMes.set(value);
  }
}

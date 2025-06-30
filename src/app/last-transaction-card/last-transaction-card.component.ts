import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit } from '@angular/core';
import { Transaccion } from '../shared/interfaces/transaction.interface';
import { AuthService } from '../shared/services/auth.service';
import { DashboardSvc } from '../shared/services/dashboard.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-last-transaction-card',
  templateUrl: './last-transaction-card.component.html',
  styleUrls: ['./last-transaction-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
})
export class LastTransactionCardComponent implements OnInit {
    categorias = [
  { label: 'Comida', value: 'Comida', icon: '🍔' },
  { label: 'Transporte', value: 'Transporte', icon: '🚌' },
  { label: 'Sueldo', value: 'Sueldo', icon: '💸' },
  { label: 'Juegos', value: 'Juegos', icon: '🎮' },
  { label: 'Alquiler', value: 'Alquiler', icon: '🏠' },
  { label: 'Educación', value: 'Educación', icon: '📚' },
  { label: 'Salud', value: 'Salud', icon: '🩺' },
  { label: 'Compras', value: 'Compras', icon: '🛍️' },
  { label: 'Sin categoría', value: 'Sin categoría', icon: '❓' }
];
  transaction = input<Transaccion | null>();
  modalAbierto = false;
  form!: FormGroup;
  transaccionId!: string;
  /**
   * Load transaction effect
   */
  transactionEffect = effect(() => {
    this.transaction() ? this.transaction() : null;
  });

  private authSvc = inject(AuthService);
  private dashboardService = inject(DashboardSvc);

  constructor(private fb: FormBuilder, private firestore: Firestore) {
    this.form = this.fb.group({
      descripcion: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      tipo: ['ingreso', Validators.required],
      categoria: ['Sin categoría', Validators.required]
    });

  }

  ngOnInit() {
  }

  abrirModalEditar(trans: any) {
    this.modalAbierto = true;
    this.transaccionId = trans.id; // Necesitás guardar el ID
    this.form.patchValue({
      descripcion: trans.descripcion,
      monto: trans.monto,
      tipo: trans.tipo,
      categoria: trans.categoria
    });
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async guardarCambios() {
    const userId = this.authSvc.user()?.uid;
    const ref = doc(this.firestore, `usuarios/${userId}/transacciones/${this.transaccionId}`);
    await updateDoc(ref, this.form.value);
    this.cerrarModal();
    Swal.fire({
      title: '¡Transacción actualizada!',
      showClass: {
        popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `
      },
      hideClass: {
        popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `
      },
      text: 'Los cambios se guardaron correctamente.',
      icon: 'success',
      confirmButtonColor: '#dd0e7c',
      confirmButtonText: 'Aceptar',
      background: '#fff',
      color: '#27272a'
    });

    // Podés recargar la última transacción si querés
    this.dashboardService.getUltimaTransaccion(userId!).subscribe();
    this.dashboardService.refreshTransactionsSignal.set(true); // Trigger refresh of transactions
  }

  async eliminarTransaccion() {
    Swal.fire({
      title: '¿Eliminar transacción?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dd0e7c',
      cancelButtonColor: '#6b1d68',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#27272a'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const userId = this.authSvc.user()?.uid;
        const ref = doc(this.firestore, `usuarios/${userId}/transacciones/${this.transaccionId}`);
        await deleteDoc(ref);
        // Aquí podrías actualizar la lista de transacciones o recargar la última transacción
        this.dashboardService.getUltimaTransaccion(userId!).subscribe();
        Swal.fire({
          title: '¡Eliminada!',
          showClass: {
            popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
          },
          hideClass: {
            popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
          },
          text: 'La transacción fue eliminada.',
          icon: 'success',
          confirmButtonColor: '#dd0e7c',
          confirmButtonText: 'Aceptar',
        });
        this.cerrarModal();
      }
    });



  }

}

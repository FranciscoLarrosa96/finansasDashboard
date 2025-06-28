import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, Input, OnInit } from '@angular/core';
import { Transaccion } from '../shared/interfaces/transaction.interface';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { DashboardSvc } from '../shared/services/dashboard.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-last-transaction-card',
  templateUrl: './last-transaction-card.component.html',
  styleUrls: ['./last-transaction-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LastTransactionCardComponent implements OnInit {
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
      tipo: ['ingreso', Validators.required]
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
      tipo: trans.tipo
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
    // Podés recargar la última transacción si querés
    this.dashboardService.getUltimaTransaccion(userId!).subscribe();
  }

  async eliminarTransaccion() {
    const userId = this.authSvc.user()?.uid;
    const ref = doc(this.firestore, `usuarios/${userId}/transacciones/${this.transaccionId}`);
    await deleteDoc(ref);
    this.cerrarModal();
    // Podés recargar datos si querés
  }

}

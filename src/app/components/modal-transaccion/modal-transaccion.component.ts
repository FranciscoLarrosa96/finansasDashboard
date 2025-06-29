import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaccion } from '../../shared/interfaces/transaction.interface';
import { addDoc, collection, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-modal-transaccion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-transaccion.component.html',
  styleUrl: './modal-transaccion.component.scss'
})
export class ModalTransaccionComponent {
  app = initializeApp(environment.firebaseConfig);
  db = getFirestore(this.app);
  
  @Input() transaccion: Transaccion | null = null;
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private uid = inject(AuthService).user()?.uid;

  ngOnInit() {
    this.form = this.fb.group({
      descripcion: [this.transaccion?.descripcion || '', Validators.required],
      monto: [this.transaccion?.monto || 0, [Validators.required, Validators.min(1)]],
      tipo: [this.transaccion?.tipo || 'gasto', Validators.required],
      categoria: [this.transaccion?.categoria || '', Validators.required],
    });
  }

  async guardar() {
    const data = {
      ...this.form.value,
      fecha: this.transaccion?.fecha || new Date()
    };

    if (this.transaccion?.id) {
      const ref = doc(this.db, `usuarios/${this.uid}/transacciones/${this.transaccion.id}`);
      await updateDoc(ref, data);
    } else {
      const ref = collection(this.db, `usuarios/${this.uid}/transacciones`);
      await addDoc(ref, data);
    }
    this.guardado.emit();

    this.cerrar.emit();
  }

}

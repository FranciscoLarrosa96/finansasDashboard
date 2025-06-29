import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSvc } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { Transaccion } from '../../shared/interfaces/transaction.interface';
import { Firestore, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { ModalTransaccionComponent } from '../modal-transaccion/modal-transaccion.component';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { User } from 'firebase/auth';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-listado-transacciones',
  imports: [CommonModule, ModalTransaccionComponent],
  templateUrl: './listado-transacciones.component.html',
  styleUrl: './listado-transacciones.component.scss'
})
export class ListadoTransaccionesComponent implements OnInit {
  app = initializeApp(environment.firebaseConfig);
  db = getFirestore(this.app);
  transacciones: Transaccion[] = [];
  modalAbierto = false;
  transaccionEditando: Transaccion | null = null;
  user: User = {} as User;
  private authService = inject(AuthService);
  /**
 * Load User effect
 */
  loadUser = effect(() => {
    this.user = this.authService.user() || {} as User;
    if (this.user.uid !== undefined) {
      const uid = this.user.uid;
      this.cargarTransacciones(uid);
    }
  });

  async ngOnInit() {
  }

  /**
   * Carga las transacciones del usuario
   * @param uid 
   */
  async cargarTransacciones(uid: string = this.user.uid) {
    const ref = collection(this.db, 'usuarios', uid, 'transacciones');
    const q = query(ref, orderBy('fecha', 'desc')); // 👈 orden por fecha descendente
    const snapshot = await getDocs(q);

    this.transacciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaccion));
  }


  abrirModal(transaccion: Transaccion | null = null) {
    this.transaccionEditando = transaccion;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.transaccionEditando = null;
    this.cargarTransacciones();
  }

  async eliminar(id: string) {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta transacción será eliminada permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dd0e7c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        const ref = doc(this.db, 'usuarios', this.user.uid, 'transacciones', id);
        await deleteDoc(ref);
        await this.cargarTransacciones();

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La transacción fue eliminada con éxito.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar la transacción.'
        });
        console.error(error);
      }
    }
  }

}

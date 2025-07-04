import { computed, inject, Injectable, signal } from "@angular/core";
import { map, Observable } from "rxjs";
import { Transaccion } from "../interfaces/transaction.interface";
import { collection, DocumentData, limit, orderBy, query, getDocs } from "firebase/firestore";
import { collectionData } from "@angular/fire/firestore";
import { Firestore } from '@angular/fire/firestore';


@Injectable({
    providedIn: 'root'
})
export class DashboardSvc {
    refreshTransactionsSignal = signal<boolean>(false); // Signal to trigger refresh of transactions
    refreshTransactionsComputed = computed(() => this.refreshTransactionsSignal());
    private firestore = inject(Firestore);


    getUltimaTransaccion(uid: string): Observable<Transaccion | null> {
        const transaccionesRef = collection(this.firestore, `usuarios/${uid}/transacciones`);
        const q = query(transaccionesRef, orderBy('fecha', 'desc'), limit(1));

        return collectionData<DocumentData>(q, { idField: 'id' }).pipe(
            map((transacciones: any[]) => transacciones[0] as Transaccion || null)
        );

    }

    getTransaccionesPorUsuario(uid: string) {
        const transRef = collection(this.firestore, `usuarios/${uid}/transacciones`);
        return getDocs(transRef);
    }
}
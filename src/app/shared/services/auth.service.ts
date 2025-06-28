import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, User, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { initializeApp } from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class AuthService {
    app = initializeApp(environment.firebaseConfig);
    db = getFirestore(this.app);
    private auth = inject(Auth);
    private router = inject(Router);
    private userSignal = signal<User | null>(null);

    // Exponemos el usuario como señal
    readonly user = computed(() => this.userSignal());

    // Booleano de sesión activa
    readonly isLoggedIn = computed(() => this.user() !== null);

    constructor() {
        authState(this.auth).subscribe(user => {
            this.userSignal.set(user);
        });
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        const user = result.user;

        const userRef = doc(this.db, 'usuarios', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // Creamos el doc de usuario
            await setDoc(userRef, {
                email: user.email,
                nombre: user.displayName || 'Sin nombre',
                ingresos: 0,
                gastos: 0,
                creadoEn: new Date()
            });

            // Creamos una transacción inicial
            await this.crearTransaccionInicial(user.uid);
        }

        return result;
    }

    async isGoogleAccount(email: string): Promise<boolean> {
        const methods = await fetchSignInMethodsForEmail(this.auth, email);
        return methods.includes('google.com');
    }

    loginWithEmail(email: string, password: string): Promise<UserCredential> {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async registerWithEmail(email: string, password: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        await this.createUserInFirestore(cred.user);
        return cred;
    }

    logout(): Promise<void> {
        return signOut(this.auth).then(() => {
            this.router.navigate(['/login']);
        });
    }

    async register(email: string, password: string): Promise<UserCredential> {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        await this.createUserInFirestore(cred.user);
        return cred;
    }


    async createUserInFirestore(user: any) {
        const userRef = doc(this.db, 'usuarios', user.uid);
        await setDoc(userRef, {
            email: user.email,
            nombre: user.displayName || 'Sin nombre',
            ingresos: 0,
            gastos: 0,
            creadoEn: new Date()
        });

        await this.crearTransaccionInicial(user.uid);
    }



    private async crearTransaccionInicial(userId: string) {
        const transaccionesRef = collection(this.db, 'usuarios', userId, 'transacciones');
        await addDoc(transaccionesRef, {
            descripcion: 'Transacción inicial',
            tipo: 'ingreso',
            monto: 0,
            fecha: new Date()
        });
    }
}

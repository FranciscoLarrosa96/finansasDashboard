import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, User, authState } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private userSignal = signal<User | null>(null);

    // Exponemos el usuario como señal
    readonly user = computed(() => this.userSignal());

    // Booleano de sesión activa
    readonly isLoggedIn = computed(() => this.user() !== null);

    constructor() {
        // Log opcional para debug
        authState(this.auth).subscribe(user => {
            this.userSignal.set(user);
            if (user) {
                console.log('Usuario logueado:', user);
            } else {
                console.log('No hay usuario logueado');
            }
        });
    }

    async loginWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
    }

    loginWithEmail(email: string, password: string): Promise<UserCredential> {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    logout(): Promise<void> {
        return signOut(this.auth);
    }

    register(email: string, password: string): Promise<any> {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }
}

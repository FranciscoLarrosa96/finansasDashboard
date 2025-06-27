import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { fetchSignInMethodsForEmail, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';

const firebaseApp = initializeApp(environment.firebaseConfig);
export const auth = getAuth(firebaseApp);

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errorMessage: string | null = null;
  loginForm: FormGroup;
  private router = inject(Router);
  private authService = inject(AuthService);
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /**
   *  Método para manejar el envío del formulario de inicio de sesión.
   */
  loginWithGoogle() {
    this.authService.loginWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.error('Error al loguearse con Google:', error);
      });
  }

  /**
   *  Método para manejar el envío del formulario de inicio de sesión con correo electrónico.
   *  Utiliza el servicio de autenticación para iniciar sesión.
   */
  async loginWithEmail() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    const methods = await fetchSignInMethodsForEmail(auth, email);
    const isGoogleAccount = methods.includes('google.com') && !methods.includes('password');
    console.log('Métodos:', methods);

    if (isGoogleAccount) {
      this.errorMessage = 'Este usuario está registrado con Google. Ingresá con Google.';
      return;
    }

    this.authService.loginWithEmail(email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(error => {
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage = 'El usuario no existe.';
            break;
          case 'auth/wrong-password':
            this.errorMessage = 'La contraseña es incorrecta.';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'El formato del email no es válido.';
            break;
          default:
            this.errorMessage = 'Error al iniciar sesión. Intentá nuevamente o intenta con Google.';
            break;
        }
      });
  }

}

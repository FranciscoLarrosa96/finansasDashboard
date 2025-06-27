import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

const firebaseApp = initializeApp(environment.firebaseConfig);
export const auth = getAuth(firebaseApp);

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

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
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Error al loguearse con Google:', error);
      });
  }

  /**
   *  Método para manejar el envío del formulario de inicio de sesión con correo electrónico.
   *  Utiliza el servicio de autenticación para iniciar sesión.
   */
  loginWithEmail() {
    this.authService.loginWithEmail(this.loginForm.value.email, this.loginForm.value.password)
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch(error => console.error('Error al loguearse con correo:', error));
  }
}

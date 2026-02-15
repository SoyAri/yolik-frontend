import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interface para las credenciales
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Interface para la respuesta del backend (ejemplo)
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    nombre: string;
  };
  message?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Estado del formulario
  credentials: LoginCredentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    // Aquí inyectarías tu servicio de autenticación cuando lo tengas
    // private authService: AuthService
  ) {}

  /**
   * Método principal de submit del formulario
   * Conecta aquí tu servicio de backend cuando esté listo
   */
  async onSubmit() {
    // Limpiar mensaje de error previo
    this.errorMessage = '';

    // Validación básica en frontend
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    // Validar formato de email
    if (!this.isValidEmail(this.credentials.email)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    this.isLoading = true;

    try {
      // ==============================================================
      // CONECTA AQUÍ TU BACKEND - Ejemplo de cómo sería:
      // ==============================================================

      // const response = await this.authService.login(this.credentials);

      // if (response.success && response.token) {
      //   // Guardar token en localStorage o sessionStorage
      //   if (this.credentials.rememberMe) {
      //     localStorage.setItem('authToken', response.token);
      //     localStorage.setItem('user', JSON.stringify(response.user));
      //   } else {
      //     sessionStorage.setItem('authToken', response.token);
      //     sessionStorage.setItem('user', JSON.stringify(response.user));
      //   }
      //
      //   // Redirigir a la tienda o dashboard
      //   this.router.navigate(['/tienda']);
      // }

      // ==============================================================
      // SIMULACIÓN (Quitar cuando tengas backend real)
      // ==============================================================
      await this.simulateLogin();

    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = error.message || 'Error al iniciar sesión. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Login con Google
   * Implementa aquí tu integración con Google OAuth
   */
  async loginWithGoogle() {
    console.log('Login with Google clicked');
    // Implementar OAuth de Google aquí
    // Ejemplo: this.authService.googleLogin()
  }

  /**
   * Login con Facebook
   * Implementa aquí tu integración con Facebook OAuth
   */
  async loginWithFacebook() {
    console.log('Login with Facebook clicked');
    // Implementar OAuth de Facebook aquí
    // Ejemplo: this.authService.facebookLogin()
  }

  /**
   * Validador de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * SIMULACIÓN DE LOGIN - ELIMINAR CUANDO TENGAS BACKEND
   * Esta función simula una llamada al backend con un delay
   */
  private async simulateLogin(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular credenciales de prueba
        if (this.credentials.email === 'demo@yolik.com' && this.credentials.password === 'demo123') {
          // Login exitoso
          const fakeToken = 'fake-jwt-token-' + Date.now();
          const fakeUser = {
            id: 1,
            email: this.credentials.email,
            nombre: 'Usuario Demo'
          };

          // Guardar en storage según "Recordarme"
          if (this.credentials.rememberMe) {
            localStorage.setItem('authToken', fakeToken);
            localStorage.setItem('user', JSON.stringify(fakeUser));
          } else {
            sessionStorage.setItem('authToken', fakeToken);
            sessionStorage.setItem('user', JSON.stringify(fakeUser));
          }

          console.log('Login simulado exitoso');

          // Redirigir a la tienda
          this.router.navigate(['/tienda']);
          resolve();
        } else {
          // Login fallido
          reject(new Error('Credenciales incorrectas. Intenta con: demo@yolik.com / demo123'));
        }
      }, 1500); // Simula 1.5 segundos de latencia de red
    });
  }
}

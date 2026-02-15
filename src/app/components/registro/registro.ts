import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
  };
  message?: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  formData: RegisterFormData = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router
    // Inyecta tu AuthService aquí cuando lo tengas
  ) {}

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.formData.email || !this.formData.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    try {
      // CONECTA AQUÍ TU BACKEND
      // const response = await this.authService.register({
      //   email: this.formData.email,
      //   password: this.formData.password
      // });

      // SIMULACIÓN
      await this.simulateRegister();

    } catch (error: any) {
      console.error('Error en registro:', error);
      this.errorMessage = error.message || 'Error al crear la cuenta. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  // Validador de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // SIMULACIÓN - ELIMINAR CUANDO TENGAS BACKEND
  private async simulateRegister(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular validación de email existente
        if (this.formData.email === 'existente@yolik.com') {
          reject(new Error('Este correo ya está registrado'));
          return;
        }

        // Registro exitoso
        this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo...';

        const fakeToken = 'fake-jwt-token-' + Date.now();
        const fakeUser = {
          id: Date.now(),
          email: this.formData.email
        };

        // Guardar en localStorage
        localStorage.setItem('authToken', fakeToken);
        localStorage.setItem('user', JSON.stringify(fakeUser));

        console.log('Registro simulado exitoso:', fakeUser);

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/tienda']);
        }, 2000);

        resolve();
      }, 1500);
    });
  }
}

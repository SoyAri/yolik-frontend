import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui';
import { CarritoService } from '../../services/cartitem';
import { AuthService } from '@auth0/auth0-angular';

interface ShippingData {
  nombre: string;
  telefono: string;
  calle: string;
  colonia: string;
  ciudad: string;
  codigoPostal: string;
  estado: string;
  referencias: string;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  ui = inject(UiService);
  carrito = inject(CarritoService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;

  // Mientras verificamos sesión, no mostramos nada
  verificando = signal(true);

  shippingData: ShippingData = {
    nombre: '', telefono: '', calle: '',
    colonia: '', ciudad: '', codigoPostal: '',
    estado: '', referencias: ''
  };

  discountCode = '';
  discountApplied = false;
  discountAmount = 0;
  shippingCost = 120;
  freeShippingThreshold = 1500;

  ngOnInit() {
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);

    if (!isPlatformBrowser(this.platformId) || !this.auth) {
      this.verificando.set(false);
      return;
    }

    // Esperar a que Auth0 confirme si hay sesión o no
    this.auth.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        if (!isAuthenticated) {
          // No hay sesión, mandar al login sin mostrar nada
          this.auth?.loginWithRedirect({ appState: { target: '/carrito' } });
          return;
        }

        // Hay sesión confirmada, ahora sí cargar el carrito
        this.verificando.set(false);
        this.carrito.sincronizarConBackend();
      },
      error: () => {
        this.auth?.loginWithRedirect({ appState: { target: '/carrito' } });
      }
    });
  }

  get cartItems() {
    return this.carrito.itemsDetalle();
  }

  get itemCount(): number {
    return this.carrito.cantidad;
  }

  get subtotal(): number {
    return this.carrito.total;
  }

  get shipping(): number {
    return this.subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost;
  }

  get total(): number {
    return this.subtotal + this.shipping - this.discountAmount;
  }

  updateQuantity(id: string, cantidad: number) {
    this.carrito.actualizarCantidad(id, cantidad);
  }

  removeItem(id: string) {
    this.carrito.quitarProducto(id);
  }

  clearCart() {
    if (confirm('¿Estás segura de vaciar el carrito?')) {
      this.carrito.limpiarCarrito();
    }
  }

  applyDiscount() {
    if (this.discountCode.toUpperCase() === 'YOLIK2026') {
      this.discountApplied = true;
      this.discountAmount = Math.round(this.subtotal * 0.1);
    }
  }

  removeDiscount() {
    this.discountApplied = false;
    this.discountAmount = 0;
    this.discountCode = '';
  }

  proceedToCheckout() {
    console.log('Procesando pedido:', {
      items: this.cartItems,
      shippingData: this.shippingData,
      total: this.total
    });
    alert('¡Pedido procesado!\nTotal: $' + this.total);
  }
}

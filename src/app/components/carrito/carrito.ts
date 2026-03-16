import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UiService } from '../../services/ui';
import { CarritoService } from '../../services/cartitem';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

type Paso = 'carrito' | 'envio' | 'pago' | 'confirmacion';

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
export class Carrito implements OnInit, OnDestroy {
  ui         = inject(UiService);
  carrito    = inject(CarritoService);
  router     = inject(Router);
  http       = inject(HttpClient);
  cdr        = inject(ChangeDetectorRef);
  ngZone     = inject(NgZone);
  platformId = inject(PLATFORM_ID);
  auth       = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;

  private apiUrl = environment.apiUrl;
  private token  = '';

  // ── Flujo por pasos ──────────────────────────────────────────────
  pasoActual = signal<Paso>('carrito');

  // ── Auth ─────────────────────────────────────────────────────────
  verificando = signal(true);

  // ── Datos de envío ───────────────────────────────────────────────
  shippingData: ShippingData = {
    nombre: '', telefono: '', calle: '',
    colonia: '', ciudad: '', codigoPostal: '',
    estado: '', referencias: ''
  };

  // ── Descuento ────────────────────────────────────────────────────
  discountCode    = '';
  discountApplied = false;
  discountAmount  = 0;
  discountError   = '';

  // ── Costos ───────────────────────────────────────────────────────
  readonly shippingCost          = 120;
  readonly freeShippingThreshold = 1500;

  // ── Stripe ───────────────────────────────────────────────────────
  private stripe:   Stripe | null        = null;
  private elements: StripeElements | null = null;
  private paymentEl: StripePaymentElement | null = null;

  procesandoPago  = signal(false);
  errorPago       = signal('');
  paymentIntentId = signal('');

  // ── Confirmación ─────────────────────────────────────────────────
  pedidoConfirmado = signal(false);

  // ── Computed getters ─────────────────────────────────────────────
  get cartItems()  { return this.carrito.itemsDetalle(); }
  get itemCount()  { return this.carrito.cantidad; }
  get subtotal()   { return this.carrito.total; }
  get shipping()   { return this.subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost; }
  get total()      { return this.subtotal + this.shipping - this.discountAmount; }

  // ─────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);

    if (!isPlatformBrowser(this.platformId) || !this.auth) {
      this.verificando.set(false);
      return;
    }

    this.auth.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        if (!isAuthenticated) {
          this.auth?.loginWithRedirect({ appState: { target: '/carrito' } });
          return;
        }
        this.verificando.set(false);
        this.carrito.sincronizarConBackend();

        // Obtener token igual que en administracion.ts
        this.auth!.getAccessTokenSilently().subscribe({
          next:  (t) => { this.token = t; },
          error: () => { console.warn('No se pudo obtener el token'); }
        });
      },
      error: () => this.auth?.loginWithRedirect({ appState: { target: '/carrito' } })
    });
  }

  ngOnDestroy() {
    this.paymentEl?.destroy();
  }

  // ─────────────────────────────────────────────────────────────────
  // PASO 1 → PASO 2: validar que haya items
  // ─────────────────────────────────────────────────────────────────
  irAEnvio() {
    if (!this.cartItems.length) return;
    this.pasoActual.set('envio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─────────────────────────────────────────────────────────────────
  // PASO 2 → PASO 3: crear PaymentIntent y montar Stripe Elements
  // ─────────────────────────────────────────────────────────────────
  async irAPago() {
    if (!this.shippingValido()) return;

    this.procesandoPago.set(true);
    this.errorPago.set('');
    this.cdr.detectChanges();

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

      // Armar payload igual al modelo Order
      const payload = {
        items: this.cartItems.map(i => ({
          productId: i.id,
          name:      i.nombre,
          image:     i.imagen  ?? '',

          price:     i.precio,
          quantity:  i.cantidad,
        })),
        shippingAddress: this.shippingData,
        subtotal:    this.subtotal,
        shippingCost: this.shipping,
        discount:    this.discountAmount,
      };

      // Llamar al backend — mismo patrón que administracion.ts
      const res: any = await this.http
        .post(`${this.apiUrl}/api/payments/create-intent`, payload, { headers })
        .toPromise();

      const clientSecret = res.clientSecret;
      this.paymentIntentId.set(res.paymentIntentId);

      // Cargar Stripe.js con tu publishable key
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) throw new Error('No se pudo cargar Stripe');

      // Crear Elements con el clientSecret
      this.elements = this.stripe.elements({ clientSecret, locale: 'es-419' });

      this.pasoActual.set('pago');
      this.procesandoPago.set(false);
      this.cdr.detectChanges();

      // Montar el Payment Element en el DOM (esperar a que renderice)
      setTimeout(() => {
        const container = document.getElementById('stripe-payment-element');
        if (!container || !this.elements) return;

        this.paymentEl = this.elements.create('payment');
        this.paymentEl.mount('#stripe-payment-element');
        this.cdr.detectChanges();
      }, 100);

    } catch (err: any) {
      this.procesandoPago.set(false);
      this.errorPago.set(err?.error?.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
      this.cdr.detectChanges();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PASO 3: confirmar pago con Stripe
  // ─────────────────────────────────────────────────────────────────
  async confirmarPago() {
    if (!this.stripe || !this.elements) return;

    this.procesandoPago.set(true);
    this.errorPago.set('');
    this.cdr.detectChanges();

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      redirect: 'if_required',   // no redirige a menos que el método lo requiera
    });

    if (error) {
      this.ngZone.run(() => {
        this.procesandoPago.set(false);
        this.errorPago.set(error.message ?? 'Error al procesar el pago.');
        this.cdr.detectChanges();
      });
      return;
    }

    // Pago confirmado — el webhook guardará el pedido en MongoDB
    this.ngZone.run(() => {
      this.procesandoPago.set(false);
      this.carrito.limpiarCarrito();
      this.pasoActual.set('confirmacion');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.cdr.detectChanges();
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CARRITO — acciones
  // ─────────────────────────────────────────────────────────────────
  updateQuantity(id: string, cantidad: number) { this.carrito.actualizarCantidad(id, cantidad); }
  removeItem(id: string)                        { this.carrito.quitarProducto(id); }

  clearCart() {
    if (confirm('¿Estás segura de vaciar el carrito?')) this.carrito.limpiarCarrito();
  }

  applyDiscount() {
    this.discountError = '';
    if (this.discountCode.toUpperCase() === 'YOLIK2026') {
      this.discountApplied = true;
      this.discountAmount  = Math.round(this.subtotal * 0.1);
    } else {
      this.discountError = 'Código inválido';
    }
  }

  removeDiscount() {
    this.discountApplied = false;
    this.discountAmount  = 0;
    this.discountCode    = '';
    this.discountError   = '';
  }

  // ─────────────────────────────────────────────────────────────────
  // VALIDACIÓN de envío — todos los campos requeridos menos referencias
  // ─────────────────────────────────────────────────────────────────
  shippingValido(): boolean {
    const d = this.shippingData;
    return !!(d.nombre && d.telefono && d.calle && d.colonia && d.ciudad && d.codigoPostal && d.estado);
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────────────
  getPasoNumero(paso: Paso): number {
    return { carrito: 1, envio: 2, pago: 3, confirmacion: 4 }[paso];
  }
}

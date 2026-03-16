import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

interface Pedido {
  id: string;
  orderNumber?: string;
  cliente: string;
  email?: string;
  direccion?: string;
  fecha: Date | string;
  total: number;
  estado: string;
  paymentStatus?: string;
  items: any[];
}

interface Producto {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  region?: string;
  images: string[];
  active?: boolean;
}

interface Stats {
  ventasTotales: number;
  totalPedidos: number;
  pedidosPendientes: number;
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion implements OnInit {
  vistaActual: 'stats' | 'pedidos' | 'productos' = 'stats';
  filtroPedidos = '';
  filtroEstado = '';

  stats: Stats = { ventasTotales: 0, totalPedidos: 0, pedidosPendientes: 0 };

  pedidos: Pedido[] = [];
  productos: Producto[] = [];

  tallasDisponibles: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];

  nuevoProducto: Producto = {
    name: '', description: '', price: 0, originalPrice: 0,
    stock: 0, category: 'Vestidos', region: 'Tehuacan', images: ['']
  };

  // UI state
  isLoadingProducto = false;
  formularioAbierto = false;   // <-- colapsable
  formSubmitIntentado = false; // <-- para no mostrar errores hasta que intenten guardar

  // Toast — siempre en el DOM, oculto/visible por clase CSS
  toastMensaje = '';
  toastExito = true; // true = verde, false = rojo
  toastVisible = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  cargandoAdmin = true;
  token = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : undefined;

  constructor(public ui: UiService) {}

  ngOnInit() {
    if (!this.auth) return;

    setTimeout(() => {
      this.ui.cartVisible.set(false);
      this.ui.searchVisible.set(false);
    }, 10);

    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) { this.router.navigate(['/']); return; }

      this.auth!.user$.subscribe(user => {
        if (!user) { this.router.navigate(['/']); return; }

        const roles = user['https://yolik.com/roles'] || [];
        if (!Array.isArray(roles) || !roles.includes('admin')) {
          this.router.navigate(['/']); return;
        }

        this.auth!.getAccessTokenSilently().subscribe({
          next: (token) => {
            this.token = token;
            this.cargandoAdmin = false;
            this.cdr.detectChanges();
            this.cargarDatosReales();
          },
          error: () => this.router.navigate(['/'])
        });
      });
    });
  }

  // ----------------------------------------------------------------
  // TOAST — siempre en DOM, visible/oculto via clase. Garantiza render.
  // ----------------------------------------------------------------
  mostrarToast(mensaje: string, exito: boolean, duracionMs = 4500) {
    if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }

    this.ngZone.run(() => {
      this.toastMensaje = mensaje;
      this.toastExito = exito;
      this.toastVisible = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();

      this.toastTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.toastVisible = false;
          this.toastTimer = null;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      }, duracionMs);
    });
  }

  cerrarToast() {
    if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
    this.toastVisible = false;
    this.cdr.detectChanges();
  }

  // ----------------------------------------------------------------
  // FORMULARIO colapsable
  // ----------------------------------------------------------------
  abrirFormularioNuevo() {
    this.limpiarFormularioProducto();
    this.formSubmitIntentado = false;
    this.formularioAbierto = true;
    setTimeout(() => {
      document.getElementById('form-producto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.formSubmitIntentado = false;
    this.limpiarFormularioProducto();
  }

  // ----------------------------------------------------------------
  // DATOS
  // ----------------------------------------------------------------
  cargarDatosReales() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    this.http.get<any>(`${this.apiUrl}/api/dashboard/summary?days=30`, { headers }).subscribe({
      next: (res) => {
        if (res?.metrics) {
          this.stats.ventasTotales = res.metrics.grossRevenue || 0;
          this.stats.totalPedidos = res.metrics.orders || 0;
          const pending = res.orderStatus?.find((s: any) => s.status === 'pending');
          this.stats.pedidosPendientes = pending?.count || 0;
        }
        if (res?.recentOrders) {
          this.pedidos = res.recentOrders.map((o: any) => ({
            id: o._id, orderNumber: o.orderNumber,
            cliente: o.userId?.name || 'Cliente Oculto',
            fecha: o.createdAt, total: o.total,
            estado: o.status, paymentStatus: o.paymentStatus, items: []
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando stats', err)
    });

    this.cargarProductos();
  }

  cargarProductos() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    this.http.get<any>(`${this.apiUrl}/api/dashboard/products`, { headers }).subscribe({
      next: (res) => { this.productos = res.products || res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  private recargarProductos(onDone?: () => void) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    this.http.get<any>(`${this.apiUrl}/api/dashboard/products`, { headers }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.productos = res.products || res;
          this.cdr.detectChanges();
          onDone?.();
        });
      },
      error: () => onDone?.()
    });
  }

  // ----------------------------------------------------------------
  // PEDIDOS
  // ----------------------------------------------------------------
  getPedidosFiltrados(): Pedido[] {
    let r = this.pedidos;
    if (this.filtroPedidos) {
      const b = this.filtroPedidos.toLowerCase();
      r = r.filter(p =>
        p.orderNumber?.toString().includes(b) ||
        p.id?.toString().includes(b) ||
        p.cliente.toLowerCase().includes(b)
      );
    }
    if (this.filtroEstado) r = r.filter(p => p.estado === this.filtroEstado);
    return r;
  }

  actualizarEstadoPedido(pedido: Pedido) {
    console.log('Actualizando estado (Simulado):', pedido.id, '->', pedido.estado);
  }

  verDetallePedido(pedido: Pedido) {
    alert(`Pedido #${pedido.orderNumber || pedido.id}\nCliente: ${pedido.cliente}\nTotal: $${pedido.total}`);
  }

  limpiarFiltros() { this.filtroPedidos = ''; this.filtroEstado = ''; }

  // ----------------------------------------------------------------
  // PRODUCTOS
  // ----------------------------------------------------------------
  agregarImagen() { this.nuevoProducto.images.push(''); }

  eliminarImagen(index: number) {
    if (this.nuevoProducto.images.length > 1) this.nuevoProducto.images.splice(index, 1);
  }

  trackByIndex(index: number): number { return index; }

  guardarProducto() {
    // Marcar que se intentó guardar (activa validaciones visuales)
    this.formSubmitIntentado = true;
    this.isLoadingProducto = true;
    this.cerrarToast();
    this.cdr.detectChanges();

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    let origPrice = this.nuevoProducto.originalPrice;
    if (origPrice != null && this.nuevoProducto.price > origPrice) origPrice = this.nuevoProducto.price;

    const payload = {
      ...this.nuevoProducto,
      originalPrice: origPrice,
      images: this.nuevoProducto.images.filter(img => img.trim() !== '')
    };

    const esEdit = !!this.nuevoProducto._id;
    const url = esEdit
      ? `${this.apiUrl}/api/dashboard/products/${this.nuevoProducto._id}`
      : `${this.apiUrl}/api/dashboard/products`;
    const req$ = esEdit ? this.http.patch(url, payload, { headers }) : this.http.post(url, payload, { headers });

    req$.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isLoadingProducto = false;
          this.formSubmitIntentado = false;
          this.formularioAbierto = false;
          this.limpiarFormularioProducto();
          this.cdr.detectChanges();
        });
        this.recargarProductos(() => {
          this.mostrarToast(esEdit ? '✓ Producto actualizado' : '✓ Producto creado', true);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoadingProducto = false;
          this.formSubmitIntentado = false;
          this.cdr.detectChanges();
        });
        this.mostrarErrorMongoose(err);
      }
    });
  }

  mostrarErrorMongoose(err: any) {
    let msg = 'Error al procesar la solicitud.';
    if (err.error) {
      if (err.error.errors && typeof err.error.errors === 'object') {
        const k = Object.keys(err.error.errors)[0];
        msg = err.error.errors[k]?.message || err.error.errors[k];
      } else if (err.error.message) {
        msg = err.error.message;
      } else if (typeof err.error === 'string') {
        msg = err.error;
      }
    }
    console.error('Error API:', err.error);
    this.mostrarToast(`Error: ${msg}`, false, 7000);
  }

  editarProducto(producto: Producto) {
    this.nuevoProducto = { ...producto };
    if (!this.nuevoProducto.images?.length) this.nuevoProducto.images = [''];
    this.formSubmitIntentado = false;
    this.formularioAbierto = true;
    setTimeout(() => {
      document.getElementById('form-producto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  eliminarProducto(producto: Producto) {
    if (!confirm(`¿Eliminar "${producto.name}"?`) || !producto._id) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    this.http.delete(`${this.apiUrl}/api/dashboard/products/${producto._id}`, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.productos = this.productos.filter(p => p._id !== producto._id);
          this.cdr.detectChanges();
        });
        this.mostrarToast(`"${producto.name}" eliminado`, true);
      },
      error: () => this.mostrarToast('No se pudo eliminar el producto', false, 7000)
    });
  }

  limpiarFormularioProducto() {
    this.nuevoProducto = {
      name: '', description: '', price: 0, originalPrice: 0,
      stock: 0, category: 'Vestidos', region: 'Tehuacan', images: ['']
    };
  }

  // ----------------------------------------------------------------
  // UTILIDADES VISTA
  // ----------------------------------------------------------------
  getEstadoClass(estado: string): string {
    const m: Record<string, string> = {
      pending:    'px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800',
      processing: 'px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800',
      shipped:    'px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800',
      delivered:  'px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800',
      cancelled:  'px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800',
    };
    return m[estado?.toLowerCase()] || 'px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800';
  }

  getEstadoSelectClass(estado: string): string {
    const m: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return m[estado?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}

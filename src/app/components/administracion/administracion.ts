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
  estado: 'Procesando' | 'En camino' | 'Entregado' | 'Cancelado';
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
    name: '', description: '', price: 0, originalPrice: undefined,
    stock: 0, category: 'Vestidos', region: 'Tehuacan', images: ['']
  };

  // UI state
  isLoadingProducto = false;
  formularioAbierto = false;
  formSubmitIntentado = false;

  // Toast
  toastMensaje = '';
  toastExito = true;
  toastVisible = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  cargandoAdmin = true;
  cargandoResumen = true;
  cargandoProductosArray = true;
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
      this.ngZone.run(() => {
        if (!isAuth) { this.router.navigate(['/']); return; }

        this.auth!.user$.subscribe(user => {
          this.ngZone.run(() => {
            if (!user) { this.router.navigate(['/']); return; }

            const roles = user['https://yolik.com/roles'] || [];
            if (!Array.isArray(roles) || !roles.includes('admin')) {
              this.router.navigate(['/']); return;
            }

            this.auth!.getAccessTokenSilently().subscribe({
              next: (token) => {
                this.ngZone.run(() => {
                  this.token = token;

                  // Limitamos a que cargue datos SOLAMENTE 1 VEZ durante el ciclo de vida del componente
                  // para que si Auth0 emite múltiples veces en F5, no se queden trabados los indicadores
                  if (this.cargandoAdmin) {
                    this.cargandoAdmin = false;
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                    this.cargarDatosReales();
                  }
                });
              },
              error: () => {
                this.ngZone.run(() => {
                  this.router.navigate(['/']);
                });
              }
            });
          });
        });
      });
    });
  }

  // ----------------------------------------------------------------
  // TOAST
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
    this.cargandoResumen = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    this.http.get<any>(`${this.apiUrl}/api/dashboard/summary?days=30`, { headers }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res?.metrics) {
            this.stats.ventasTotales = res.metrics.grossRevenue || 0;
            this.stats.totalPedidos = res.metrics.orders || 0;
            // ✅ CORREGIDO: busca por el valor en español que usa el modelo
            const pending = res.orderStatus?.find((s: any) => s.status === 'Procesando');
            this.stats.pedidosPendientes = pending?.count || 0;
          }
          if (res?.recentOrders) {
            this.pedidos = res.recentOrders.map((o: any) => ({
              id: o._id, orderNumber: o.orderNumber,
              // ✅ CORREGIDO: usa userEmail guardado en la orden
              cliente: o.userEmail || o.userId || 'Sin datos',
              fecha: o.createdAt, total: o.total,
              estado: o.status, paymentStatus: o.paymentStatus, items: []
            }));
          }
          this.cargandoResumen = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando stats', err);
          this.cargandoResumen = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      }
    });

    this.cargarProductos();
  }

  cargarProductos() {
    this.cargandoProductosArray = true;
    this.cdr.markForCheck();
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    this.http.get<any>(`${this.apiUrl}/api/dashboard/products`, { headers }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.productos = res.products || res;
          this.cargandoProductosArray = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando productos', err);
          this.cargandoProductosArray = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      }
    });
  }

  private recargarProductos(onDone?: () => void) {
    this.cargandoProductosArray = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    this.http.get<any>(`${this.apiUrl}/api/dashboard/products`, { headers }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.productos = res.products || res;
          this.cargandoProductosArray = false;
          this.cdr.detectChanges();
          onDone?.();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargandoProductosArray = false;
          this.cdr.detectChanges();
          onDone?.();
        });
      }
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

  // ✅ CORREGIDO: ahora hace el PATCH real al backend
  actualizarEstadoPedido(pedido: Pedido) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    this.http.patch(
      `${this.apiUrl}/api/orders/${pedido.id}/status`,
      { status: pedido.estado },
      { headers }
    ).subscribe({
      next: () => this.mostrarToast(`✓ Pedido actualizado a "${pedido.estado}"`, true),
      error: (err) => {
        console.error('Error actualizando estado:', err);
        this.mostrarToast('No se pudo actualizar el estado del pedido', false, 6000);
      }
    });
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

  tieneDescuentoInvalido(): boolean {
    const original = this.nuevoProducto.originalPrice;
    const final = this.nuevoProducto.price;

    if (original == null || original <= 0 || final == null) return false;
    return final > original;
  }

  guardarProducto() {
    this.formSubmitIntentado = true;
    this.cerrarToast();

    if (this.tieneDescuentoInvalido()) {
      this.mostrarToast('El precio con descuento no puede ser mayor al precio original.', false, 6000);
      this.cdr.detectChanges();
      return;
    }

    this.isLoadingProducto = true;
    this.cdr.detectChanges();

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    const payload = {
      ...this.nuevoProducto,
      originalPrice: this.nuevoProducto.originalPrice,
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
      name: '', description: '', price: 0, originalPrice: undefined,
      stock: 0, category: 'Vestidos', region: 'Tehuacan', images: ['']
    };
  }

  // ----------------------------------------------------------------
  // UTILIDADES VISTA
  // ----------------------------------------------------------------
  // ✅ CORREGIDO: keys en español para que coincidan con el enum del modelo
  getEstadoClass(estado: string): string {
    const m: Record<string, string> = {
      'Procesando': 'px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800',
      'En camino':  'px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800',
      'Entregado':  'px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800',
      'Cancelado':  'px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800',
    };
    return m[estado] || 'px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800';
  }

  // ✅ CORREGIDO: keys en español para que coincidan con el enum del modelo
  getEstadoSelectClass(estado: string): string {
    const m: Record<string, string> = {
      'Procesando': 'bg-yellow-100 text-yellow-800',
      'En camino':  'bg-blue-100 text-blue-800',
      'Entregado':  'bg-green-100 text-green-800',
      'Cancelado':  'bg-red-100 text-red-800',
    };
    return m[estado] || 'bg-gray-100 text-gray-800';
  }
}

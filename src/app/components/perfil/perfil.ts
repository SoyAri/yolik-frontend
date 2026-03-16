import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { UiService } from '../../services/ui';
import { environment } from '../../../environments/environment';

interface ItemPedido {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  nombre: string;
  calle: string;
  colonia: string;
  ciudad: string;
  codigoPostal: string;
  estado: string;
}

interface Pedido {
  _id: string;
  createdAt: string;
  status: 'Procesando' | 'En camino' | 'Entregado' | 'Cancelado';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: ItemPedido[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  ui         = inject(UiService);
  router     = inject(Router);
  http       = inject(HttpClient);
  platformId = inject(PLATFORM_ID);
  auth       = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;

  private apiUrl = environment.apiUrl;

  userPicture  = signal('');
  userEmail    = signal('');
  pedidos      = signal<Pedido[]>([]);
  cargando     = signal(true);
  errorPedidos = signal('');

  ngOnInit() {
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);

    if (!isPlatformBrowser(this.platformId) || !this.auth) return;

    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.auth?.loginWithRedirect({ appState: { target: '/perfil' } });
        return;
      }

      this.auth!.getAccessTokenSilently().subscribe({
        next: (token) => {
          this.cargarPedidos(token);
        },
        error: () => {
          this.cargando.set(false);
          this.errorPedidos.set('No se pudo autenticar. Intenta de nuevo.');
        }
      });
    });

    this.auth.user$.subscribe((user) => {
      this.userPicture.set(user?.picture ?? '');
      this.userEmail.set(user?.email ?? '');
    });
  }

  cargarPedidos(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ count: number; orders: Pedido[] }>(`${this.apiUrl}/api/orders/my-orders`, { headers }).subscribe({
      next: (res) => {
        this.pedidos.set(res.orders ?? res as any);
        this.cargando.set(false);
      },
      error: () => {
        this.errorPedidos.set('No se pudieron cargar tus pedidos.');
        this.cargando.set(false);
      }
    });
  }

  cerrarSesion() {
    this.auth?.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  getDireccion(addr: ShippingAddress): string {
    return `${addr.calle}, ${addr.colonia}, ${addr.ciudad}, ${addr.estado} ${addr.codigoPostal}`;
  }

  getEstatusClass(status: Pedido['status']): string {
    const base = 'px-3 py-1 text-xs font-bold rounded-full flex items-center';
    switch (status) {
      case 'Entregado':  return `${base} bg-green-100 text-green-700`;
      case 'En camino':  return `${base} bg-blue-100 text-blue-700`;
      case 'Procesando': return `${base} bg-yellow-100 text-yellow-700`;
      case 'Cancelado':  return `${base} bg-red-100 text-red-700`;
      default:           return `${base} bg-gray-100 text-gray-600`;
    }
  }

  getEstatusIcon(status: Pedido['status']): string {
    switch (status) {
      case 'Entregado':  return 'fa-solid fa-circle-check';
      case 'En camino':  return 'fa-solid fa-truck';
      case 'Procesando': return 'fa-solid fa-clock';
      case 'Cancelado':  return 'fa-solid fa-circle-xmark';
      default:           return 'fa-solid fa-circle';
    }
  }

  getPaymentBadge(ps: Pedido['paymentStatus']): string {
    switch (ps) {
      case 'paid':     return 'bg-green-100 text-green-700';
      case 'pending':  return 'bg-yellow-100 text-yellow-700';
      case 'failed':   return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-purple-100 text-purple-700';
      default:         return 'bg-gray-100 text-gray-600';
    }
  }

  getPaymentLabel(ps: Pedido['paymentStatus']): string {
    switch (ps) {
      case 'paid':     return 'Pagado';
      case 'pending':  return 'Pendiente';
      case 'failed':   return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default:         return ps;
    }
  }
}

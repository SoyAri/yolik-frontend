import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UiService } from '../../services/ui';

// --- Interfaces ---

interface ItemPedido {
  productoId: string;
  nombre: string;
  imagen: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

interface Pedido {
  id: string;
  fecha: string;
  estatus: 'Entregado' | 'En camino' | 'Procesando' | 'Cancelado';
  items: ItemPedido[];
  direccion: string;
  envio: number;
  descuento: number;
  total: number;
}

// --- Mock Data ---
// TODO: Reemplazar con llamada al endpoint real de pedidos del usuario

const MOCK_PEDIDOS: Pedido[] = [
  {
    id: '#YOL-20240301',
    fecha: '1 Mar 2024',
    estatus: 'Entregado',
    envio: 0,
    descuento: 0,
    total: 1780,
    direccion: 'Calle Morelos 45, Col. Centro, San Gabriel Chilac, Puebla',
    items: [
      {
        productoId: 'prod_001',
        nombre: 'Vestido Bordado Tradicional Chilac',
        imagen: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?q=80&w=400',
        categoria: 'Vestidos',
        precio: 890,
        cantidad: 2,
      },
    ],
  },
  {
    id: '#YOL-20240415',
    fecha: '15 Abr 2024',
    estatus: 'En camino',
    envio: 120,
    descuento: 89,
    total: 961,
    direccion: 'Av. Independencia 12, Col. Reforma, Tehuacán, Puebla',
    items: [
      {
        productoId: 'prod_002',
        nombre: 'Blusa Huipil con Bordado Floral',
        imagen: 'https://images.unsplash.com/photo-1594938298603-c8148c4b0f2a?q=80&w=400',
        categoria: 'Blusas',
        precio: 450,
        cantidad: 1,
      },
      {
        productoId: 'prod_003',
        nombre: 'Collar de Chaquiras Multicolor',
        imagen: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400',
        categoria: 'Accesorios',
        precio: 380,
        cantidad: 1,
      },
    ],
  },
  {
    id: '#YOL-20240520',
    fecha: '20 May 2024',
    estatus: 'Procesando',
    envio: 120,
    descuento: 0,
    total: 620,
    direccion: 'Calle Hidalgo 88, Col. San Juan, Tehuacán, Puebla',
    items: [
      {
        productoId: 'prod_004',
        nombre: 'Aretes de Palma Trenzada',
        imagen: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400',
        categoria: 'Accesorios',
        precio: 250,
        cantidad: 1,
      },
      {
        productoId: 'prod_005',
        nombre: 'Blusa Región Tehuacán Bordada',
        imagen: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=400',
        categoria: 'Blusas',
        precio: 370,
        cantidad: 1,
      },
    ],
  },
];

// --- Component ---

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  ui = inject(UiService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;

  // Signals derivados del auth, siempre string (nunca null)
  userPicture = signal('');
  userEmail = signal('');

  // TODO: Reemplazar por llamada al servicio real cuando el endpoint esté listo
  pedidos: Pedido[] = MOCK_PEDIDOS;

  ngOnInit() {
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);

    if (!isPlatformBrowser(this.platformId) || !this.auth) return;

    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.auth?.loginWithRedirect({ appState: { target: '/perfil' } });
      }
    });

    this.auth.user$.subscribe((user) => {
      this.userPicture.set(user?.picture ?? '');
      this.userEmail.set(user?.email ?? '');
    });
  }

  cerrarSesion() {
    this.auth?.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  getEstatusClass(estatus: Pedido['estatus']): string {
    const base = 'px-3 py-1 text-xs font-bold rounded-full flex items-center';
    switch (estatus) {
      case 'Entregado':  return `${base} bg-green-100 text-green-700`;
      case 'En camino':  return `${base} bg-blue-100 text-blue-700`;
      case 'Procesando': return `${base} bg-yellow-100 text-yellow-700`;
      case 'Cancelado':  return `${base} bg-red-100 text-red-700`;
      default:           return `${base} bg-gray-100 text-gray-600`;
    }
  }

  getEstatusIcon(estatus: Pedido['estatus']): string {
    switch (estatus) {
      case 'Entregado':  return 'fa-solid fa-circle-check';
      case 'En camino':  return 'fa-solid fa-truck';
      case 'Procesando': return 'fa-solid fa-clock';
      case 'Cancelado':  return 'fa-solid fa-circle-xmark';
      default:           return 'fa-solid fa-circle';
    }
  }
}

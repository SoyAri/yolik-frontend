import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UiService } from './ui';
import { environment } from '../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Solo esto se guarda en localStorage
export interface CartStorage {
  id: string;
  cantidad: number;
}

// Esto es lo que se muestra en pantalla
export interface CartItemDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  cantidad: number;
  stock: number;
  sinStock: boolean;
  precioActualizado: boolean;
  noDisponible: boolean;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private ui = inject(UiService);
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'yolik_carrito';

  private _storage = signal<CartStorage[]>([]);
  itemsDetalle = signal<CartItemDetalle[]>([]);
  cargando = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarDesdeStorage();
      if (this._storage().length > 0) {
        this.sincronizarConBackend();
      }
    }
  }

  private cargarDesdeStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: CartStorage[] = JSON.parse(data);
        const validos = parsed.filter(i => i.id && i.cantidad > 0);
        this._storage.set(validos);
      }
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      this._storage.set([]);
    }
  }

  private guardarEnStorage() {
    if (isPlatformBrowser(this.platformId)) {
      // Solo guarda id y cantidad
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._storage()));
    }
  }

  sincronizarConBackend() {
    const storage = this._storage();
    if (storage.length === 0) {
      this.itemsDetalle.set([]);
      return;
    }

    this.cargando.set(true);

    // Consulta cada producto por su ID usando el endpoint existente
    const peticiones = storage.map(s =>
      this.http.get<any>(`${environment.apiUrl}/api/products/${s.id}`).pipe(
        catchError(() => of(null)) // Si falla, retorna null (producto eliminado)
      )
    );

    forkJoin(peticiones).subscribe({
      next: (productos) => {
        const detalle: CartItemDetalle[] = [];
        const storageActualizado: CartStorage[] = [];

        for (let i = 0; i < storage.length; i++) {
          const s = storage[i];
          const producto = productos[i];
          const detalleAnterior = this.itemsDetalle().find(d => d.id === s.id);

          // Producto eliminado o inactivo
          if (!producto || !producto.active) continue;

          const sinStock = producto.stock === 0 || producto.stockStatus === 'Sin existencias';
          const precioAnterior = detalleAnterior?.precio;
          const precioActualizado = precioAnterior !== undefined && precioAnterior !== producto.price;

          // Ajustar cantidad si hay menos stock del pedido
          const cantidadAjustada = sinStock ? 0 : Math.min(s.cantidad, producto.stock);

          detalle.push({
            id: s.id,
            nombre: producto.name,
            descripcion: producto.description,
            precio: producto.price,
            precioAnterior: precioActualizado ? precioAnterior : undefined,
            imagen: producto.images?.[0] ?? '',
            cantidad: cantidadAjustada,
            stock: producto.stock,
            sinStock,
            precioActualizado,
            noDisponible: !producto.active
          });

          // Solo guarda en storage si tiene stock
          if (!sinStock) {
            storageActualizado.push({ id: s.id, cantidad: cantidadAjustada });
          }
        }

        this.itemsDetalle.set(detalle);
        this._storage.set(storageActualizado);
        this.guardarEnStorage();
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  agregarProducto(id: string): boolean {
    if (!this.ui.isLoggedIn()) return false;

    const storage = this._storage();
    const existente = storage.find(i => i.id === id);

    if (existente) {
      this._storage.set(storage.map(i =>
        i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      this._storage.set([...storage, { id, cantidad: 1 }]);
    }

    this.guardarEnStorage();
    this.sincronizarConBackend();
    return true;
  }

  actualizarCantidad(id: string, cantidad: number) {
    if (cantidad < 1) {
      this.quitarProducto(id);
      return;
    }
    this._storage.set(this._storage().map(i =>
      i.id === id ? { ...i, cantidad } : i
    ));
    this.guardarEnStorage();
    this.sincronizarConBackend();
  }

  quitarProducto(id: string) {
    this._storage.set(this._storage().filter(i => i.id !== id));
    this.itemsDetalle.set(this.itemsDetalle().filter(i => i.id !== id));
    this.guardarEnStorage();
  }

  limpiarCarrito() {
    this._storage.set([]);
    this.itemsDetalle.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  get cantidad(): number {
    return this._storage().reduce((acc, i) => acc + i.cantidad, 0);
  }

  get total(): number {
    return this.itemsDetalle()
      .filter(i => !i.sinStock)
      .reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
  }
}

import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarritoService } from '../../services/cartitem';
import { UiService } from '../../services/ui';
import { AuthService } from '@auth0/auth0-angular';
import { ProductoService, Producto } from '../../services/producto';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  private carrito = inject(CarritoService);
  private ui = inject(UiService);
  private platformId = inject(PLATFORM_ID);
  private auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;
  private productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  productoAgregado = false;
  imagenActual = 0;
  cantidad = 1;
  cargando = false;
  error: string | null = null;

  producto: Producto | null = null;
  productosRelacionados: Producto[] = [];

  ngOnInit() {
    this.ui.cartVisible.set(true);
    this.ui.searchVisible.set(false);

    this.route.params.subscribe(params => {
      const id = params['id'];
      this.cargarProducto(id);
    });
  }

  cargarProducto(id: string) {
    this.cargando = true;
    this.error = null;
    this.imagenActual = 0;
    this.cantidad = 1;
    this.cdr.detectChanges();

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    this.productoService.getProductoPorId(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarRelacionados(producto);
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el producto.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarRelacionados(producto: Producto) {
    this.productoService.getProductos({
      page: 1,
      limit: 4,
      category: producto.category
    }).subscribe({
      next: (res) => {
        this.productosRelacionados = res.products.filter(p => p._id !== producto._id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.productosRelacionados = [];
        this.cdr.detectChanges();
      }
    });
  }

  cambiarImagen(index: number) {
    this.imagenActual = index;
  }

  incrementarCantidad() {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  calcularDescuento(): number {
    if (this.producto?.originalPrice && this.producto.originalPrice > this.producto.price) {
      return Math.round(((this.producto.originalPrice - this.producto.price) / this.producto.originalPrice) * 100);
    }
    return 0;
  }

  agregarAlCarrito() {
    if (!this.producto || this.producto.stock === 0) return;

    if (!this.ui.isLoggedIn()) {
      this.auth?.loginWithRedirect();
      return;
    }

    const agregado = this.carrito.agregarProducto(this.producto._id);

    if (!agregado) {
      this.auth?.loginWithRedirect();
      return;
    }

    this.productoAgregado = true;
    setTimeout(() => this.productoAgregado = false, 1500);
    this.cantidad = 1;
  }

  verProducto(id: string) {
    this.router.navigate(['/detalle-producto', id]);
  }

  getImagenPrincipal(): string {
  return this.producto?.images?.[this.imagenActual] || '';
  }
}

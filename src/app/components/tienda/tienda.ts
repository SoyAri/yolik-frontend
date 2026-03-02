import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { UiService } from '../../services/ui';
import { CarritoService } from '../../services/cartitem';
import { ProductoService, Producto } from '../../services/producto';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class Tienda implements OnInit {
  public ui = inject(UiService);
  public carrito = inject(CarritoService);
  private productoService = inject(ProductoService);
  private platformId = inject(PLATFORM_ID);
  private auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  cargando = false;
  error: string | null = null;

  paginaActual = 1;
  totalPaginas = 1;
  totalProductos = 0;
  readonly porPagina = 12;

  categoriaSeleccionada = '';
  regionSeleccionada = '';
  busqueda = '';

  readonly categorias = ['Vestidos', 'Blusas', 'Accesorios', 'Otro'];
  readonly regiones = ['Tehuacan', 'otro'];

  productoAgregado: string | null = null;

  ngOnInit() {
    this.ui.cartVisible.set(true);
    this.ui.searchVisible.set(false);
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.error = null;
    this.cdr.detectChanges();

    this.productoService.getProductos({
      page: this.paginaActual,
      limit: this.porPagina,
      category: this.categoriaSeleccionada || undefined,
      region: this.regionSeleccionada || undefined,
      search: this.busqueda || undefined
    }).subscribe({
      next: (res) => {
        this.productos = res.products;
        this.totalPaginas = res.totalPages;
        this.totalProductos = res.total;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los productos. Intenta de nuevo.';
        this.cargando = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  filtrarCategoria(categoria: string) {
    this.categoriaSeleccionada = this.categoriaSeleccionada === categoria ? '' : categoria;
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarRegion(region: string) {
    this.regionSeleccionada = this.regionSeleccionada === region ? '' : region;
    this.paginaActual = 1;
    this.cargarProductos();
  }

  buscar() {
    this.paginaActual = 1;
    this.cargarProductos();
  }

  irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarProductos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPaginasArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      pages.push(i);
    }
    return pages;
  }

  getImagenPrincipal(producto: Producto): string {
  return producto.images?.[0] || '';
  }

  getBadgeColor(producto: Producto): string {
    if (producto.stockStatus === 'Sin existencias') return 'bg-red-500';
    if (producto.stock <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getBadgeText(producto: Producto): string {
    if (producto.stockStatus === 'Sin existencias') return 'Agotado';
    if (producto.stock <= 5) return 'Pocas unidades';
    return 'En stock';
  }

  agregarAlCarrito(evento: Event, producto: Producto) {
    evento.preventDefault();
    evento.stopPropagation();

    if (producto.stockStatus === 'Sin existencias') return;

    const agregado = this.carrito.agregarProducto(producto._id); // 👈 Solo el ID

    if (!agregado) {
      this.auth?.loginWithRedirect();
      return;
    }

    this.productoAgregado = producto._id;
    setTimeout(() => this.productoAgregado = null, 1500);
  }
}

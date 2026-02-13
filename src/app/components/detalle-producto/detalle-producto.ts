import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  stock: number;
  imagenes: string[];
  caracteristicas: string[];
}

interface ProductoRelacionado {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {

  // Estado
  imagenActual = 0;
  cantidad = 1;
  productoId: number = 1;

  // Producto actual (datos de prueba - después viene del backend)
  producto: Producto = {
    id: 1,
    nombre: 'Blusa Bordada Rosa Mexicano',
    categoria: 'Blusas Tradicionales',
    descripcion: 'Hermosa blusa tradicional de Tehuacán, Puebla, elaborada 100% a mano por artesanas locales. Cada bordado cuenta una historia de nuestra cultura y tradición. Confeccionada en manta de algodón suave y transpirable, perfecta para cualquier ocasión. Los motivos florales en tonos rosa mexicano representan la primavera y la alegría de nuestra tierra.',
    precio: 450,
    precioOriginal: 550,
    stock: 8,
    imagenes: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
      'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800',
      'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800'
    ],
    caracteristicas: [
      '100% algodón natural',
      'Bordado a mano por artesanas de Tehuacán',
      'Diseño único y exclusivo',
      'Tallas disponibles: S, M, L, XL',
      'Cuidado: Lavar a mano en agua fría',
      'Hecho en México'
    ]
  };

  // Productos relacionados (datos de prueba)
  productosRelacionados: ProductoRelacionado[] = [
    {
      id: 2,
      nombre: 'Rebozo Tradicional Multicolor',
      categoria: 'Rebozos',
      precio: 580,
      imagen: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800'
    },
    {
      id: 3,
      nombre: 'Vestido Tehuacán Flores',
      categoria: 'Vestidos',
      precio: 890,
      imagen: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800'
    },
    {
      id: 4,
      nombre: 'Huipil Tradicional Azul',
      categoria: 'Huipiles',
      precio: 720,
      imagen: 'https://images.unsplash.com/photo-1558769132-cb1aea8f1cf5?q=80&w=800'
    },
    {
      id: 5,
      nombre: 'Blusa Flores Primavera',
      categoria: 'Blusas',
      precio: 520,
      imagen: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el ID del producto desde la URL
    this.route.params.subscribe(params => {
      this.productoId = +params['id']; // El + convierte string a number
      this.cargarProducto(this.productoId);
    });
  }

  // Cargar producto desde el backend (por ahora usa datos de prueba)
  cargarProducto(id: number) {
    // TODO: Llamar al servicio del backend
    // this.productoService.obtenerProducto(id).subscribe(...)

    // Por ahora solo cambiamos el ID
    this.producto.id = id;

    // Resetear estado
    this.imagenActual = 0;
    this.cantidad = 1;

    // Scroll al inicio
    window.scrollTo(0, 0);
  }

  // Cambiar imagen del carrusel
  cambiarImagen(index: number) {
    this.imagenActual = index;
  }

  // Incrementar cantidad
  incrementarCantidad() {
    if (this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  // Decrementar cantidad
  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  // Calcular porcentaje de descuento
  calcularDescuento(): number {
    if (this.producto.precioOriginal) {
      const descuento = ((this.producto.precioOriginal - this.producto.precio) / this.producto.precioOriginal) * 100;
      return Math.round(descuento);
    }
    return 0;
  }

  // Agregar al carrito
  agregarAlCarrito() {
    if (this.producto.stock === 0) return;

    // TODO: Llamar al servicio del carrito
    // this.carritoService.agregar(this.producto, this.cantidad);

    console.log(`Agregando ${this.cantidad} unidad(es) de ${this.producto.nombre} al carrito`);

    // Mostrar notificación (opcional)
    alert(`¡${this.cantidad} ${this.producto.nombre} agregado(s) al carrito!`);

    // Resetear cantidad
    this.cantidad = 1;
  }

  // Ver detalle de otro producto
  verProducto(id: number) {
    this.router.navigate(['/detalle-producto', id]);
  }
}

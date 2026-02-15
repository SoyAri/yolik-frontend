import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui';

// Interfaces
interface Pedido {
  id: number;
  cliente: string;
  email: string;
  direccion: string;
  fecha: Date;
  total: number;
  estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  items: any[];
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fechaRegistro: Date;
  totalPedidos: number;
  totalGastado: number;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenes: string[];
  tallas: string[];
}

interface Stats {
  ventasTotales: number;
  totalPedidos: number;
  totalUsuarios: number;
  pedidosPendientes: number;
  ventasHoy: number;
  pedidosHoy: number;
  ventasSemana: number;
  pedidosSemana: number;
  ventasMes: number;
  pedidosMes: number;
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion implements OnInit {
  vistaActual: 'stats' | 'pedidos' | 'usuarios' | 'productos' = 'stats';
  filtroPedidos = '';
  filtroEstado = '';
  filtroUsuarios = '';

  stats: Stats = {
    ventasTotales: 0,
    totalPedidos: 0,
    totalUsuarios: 0,
    pedidosPendientes: 0,
    ventasHoy: 0,
    pedidosHoy: 0,
    ventasSemana: 0,
    pedidosSemana: 0,
    ventasMes: 0,
    pedidosMes: 0
  };

  pedidos: Pedido[] = [];
  usuarios: Usuario[] = [];
  productos: Producto[] = [];

  // Tallas disponibles
  tallasDisponibles: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];

  nuevoProducto: Producto = {
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    imagenes: [''],
    tallas: []
  };
  isLoadingProducto = false;
  mensajeProducto = '';

  constructor(public ui: UiService) {}


  ngOnInit() {
    this.cargarDatosSimulados();
    this.calcularStats();
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);
  }

  getPedidosFiltrados(): Pedido[] {
    let resultado = this.pedidos;
    if (this.filtroPedidos) {
      const busqueda = this.filtroPedidos.toLowerCase();
      resultado = resultado.filter(p =>
        p.id.toString().includes(busqueda) ||
        p.cliente.toLowerCase().includes(busqueda) ||
        p.email.toLowerCase().includes(busqueda)
      );
    }
    if (this.filtroEstado) {
      resultado = resultado.filter(p => p.estado === this.filtroEstado);
    }
    return resultado;
  }

  actualizarEstadoPedido(pedido: Pedido) {
    console.log('Actualizando estado del pedido:', pedido.id, 'a', pedido.estado);
    this.calcularStats();
  }

  verDetallePedido(pedido: Pedido) {
    alert(`Pedido #${pedido.id}\nCliente: ${pedido.cliente}\nDirección: ${pedido.direccion}\nTotal: $${pedido.total}`);
  }

  limpiarFiltros() {
    this.filtroPedidos = '';
    this.filtroEstado = '';
  }

  getUsuariosFiltrados(): Usuario[] {
    let resultado = this.usuarios;
    if (this.filtroUsuarios) {
      const busqueda = this.filtroUsuarios.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda)
      );
    }
    return resultado;
  }

  verDetalleUsuario(usuario: Usuario) {
    alert(`Usuario: ${usuario.nombre}\nCorreo: ${usuario.email}\nPedidos: ${usuario.totalPedidos}\nTotal: $${usuario.totalGastado}`);
  }

  eliminarUsuario(usuario: Usuario) {
    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return;
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    this.calcularStats();
  }

  limpiarFiltrosUsuarios() {
    this.filtroUsuarios = '';
  }

  // ==================== PRODUCTOS ====================

  // Agregar/quitar talla
  toggleTalla(talla: string) {
    const index = this.nuevoProducto.tallas.indexOf(talla);
    if (index > -1) {
      this.nuevoProducto.tallas.splice(index, 1);
    } else {
      this.nuevoProducto.tallas.push(talla);
    }
  }

  // Agregar campo de imagen
  agregarImagen() {
    this.nuevoProducto.imagenes.push('');
  }

  // Eliminar campo de imagen
  eliminarImagen(index: number) {
    if (this.nuevoProducto.imagenes.length > 1) {
      this.nuevoProducto.imagenes.splice(index, 1);
    }
  }

  guardarProducto() {
    this.isLoadingProducto = true;
    this.mensajeProducto = '';
    this.nuevoProducto.id = this.productos.length > 0
      ? Math.max(...this.productos.map(p => p.id)) + 1
      : 1;

    setTimeout(() => {
      this.productos.push({...this.nuevoProducto});
      this.mensajeProducto = '✓ Producto guardado';
      this.limpiarFormularioProducto();
      this.isLoadingProducto = false;
      setTimeout(() => this.mensajeProducto = '', 3000);
    }, 1000);
  }

  editarProducto(producto: Producto) {
    this.nuevoProducto = {...producto};
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarProducto(producto: Producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    this.productos = this.productos.filter(p => p.id !== producto.id);
  }

  limpiarFormularioProducto() {
    this.nuevoProducto = {
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagenes: [''],
      tallas: []
    };
  }

  calcularStats() {
    this.stats.ventasTotales = this.pedidos.reduce((sum, p) => sum + p.total, 0);
    this.stats.totalPedidos = this.pedidos.length;
    this.stats.totalUsuarios = this.usuarios.length;
    this.stats.pedidosPendientes = this.pedidos.filter(p => p.estado === 'Pendiente').length;

    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - 7);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const pedidosHoy = this.pedidos.filter(p =>
      new Date(p.fecha).toDateString() === hoy.toDateString()
    );
    this.stats.ventasHoy = pedidosHoy.reduce((sum, p) => sum + p.total, 0);
    this.stats.pedidosHoy = pedidosHoy.length;

    const pedidosSemana = this.pedidos.filter(p => new Date(p.fecha) >= inicioSemana);
    this.stats.ventasSemana = pedidosSemana.reduce((sum, p) => sum + p.total, 0);
    this.stats.pedidosSemana = pedidosSemana.length;

    const pedidosMes = this.pedidos.filter(p => new Date(p.fecha) >= inicioMes);
    this.stats.ventasMes = pedidosMes.reduce((sum, p) => sum + p.total, 0);
    this.stats.pedidosMes = pedidosMes.length;
  }

  getEstadoClass(estado: string): string {
    const clases = {
      'Pendiente': 'px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800',
      'Procesando': 'px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800',
      'Enviado': 'px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800',
      'Entregado': 'px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800',
      'Cancelado': 'px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800'
    };
    return clases[estado as keyof typeof clases] || '';
  }

  getEstadoSelectClass(estado: string): string {
    const clases = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Procesando': 'bg-blue-100 text-blue-800',
      'Enviado': 'bg-purple-100 text-purple-800',
      'Entregado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800'
    };
    return clases[estado as keyof typeof clases] || '';
  }

  cargarDatosSimulados() {
    const hoy = new Date();
    const hace1Dia = new Date(hoy); hace1Dia.setDate(hoy.getDate() - 1);
    const hace3Dias = new Date(hoy); hace3Dias.setDate(hoy.getDate() - 3);
    const hace7Dias = new Date(hoy); hace7Dias.setDate(hoy.getDate() - 7);
    const hace15Dias = new Date(hoy); hace15Dias.setDate(hoy.getDate() - 15);
    const hace30Dias = new Date(hoy); hace30Dias.setDate(hoy.getDate() - 30);

    this.pedidos = [
      { id: 1001, cliente: 'María García', email: 'maria@email.com', direccion: 'Calle Reforma 123, Puebla, PUE', fecha: hoy, total: 1250, estado: 'Pendiente', items: [] },
      { id: 1002, cliente: 'Juan Pérez', email: 'juan@email.com', direccion: 'Av. Juárez 456, Cholula, PUE', fecha: hoy, total: 890, estado: 'Procesando', items: [] },
      { id: 1003, cliente: 'Ana López', email: 'ana@email.com', direccion: 'Calle Hidalgo 789, Puebla, PUE', fecha: hace1Dia, total: 2100, estado: 'Enviado', items: [] },
      { id: 1004, cliente: 'Carlos Ruiz', email: 'carlos@email.com', direccion: 'Av. 5 de Mayo 321, Atlixco, PUE', fecha: hace3Dias, total: 750, estado: 'Entregado', items: [] },
      { id: 1005, cliente: 'Laura Martínez', email: 'laura@email.com', direccion: 'Calle Morelos 654, Puebla, PUE', fecha: hace3Dias, total: 1580, estado: 'Pendiente', items: [] },
      { id: 1006, cliente: 'Pedro Sánchez', email: 'pedro@email.com', direccion: 'Av. Universidad 987, Cholula, PUE', fecha: hace7Dias, total: 920, estado: 'Entregado', items: [] },
      { id: 1007, cliente: 'Sofía Hernández', email: 'sofia@email.com', direccion: 'Calle Independencia 147, Puebla, PUE', fecha: hace7Dias, total: 1450, estado: 'Cancelado', items: [] },
      { id: 1008, cliente: 'Miguel Torres', email: 'miguel@email.com', direccion: 'Av. Reforma 258, Atlixco, PUE', fecha: hace15Dias, total: 680, estado: 'Entregado', items: [] },
      { id: 1009, cliente: 'Elena Flores', email: 'elena@email.com', direccion: 'Calle Constitución 369, Puebla, PUE', fecha: hace15Dias, total: 1920, estado: 'Entregado', items: [] },
      { id: 1010, cliente: 'Roberto Díaz', email: 'roberto@email.com', direccion: 'Av. Juárez 741, Cholula, PUE', fecha: hace30Dias, total: 1100, estado: 'Entregado', items: [] }
    ];

    this.usuarios = [
      { id: 1, nombre: 'María García', email: 'maria@email.com', fechaRegistro: hace30Dias, totalPedidos: 3, totalGastado: 3250 },
      { id: 2, nombre: 'Juan Pérez', email: 'juan@email.com', fechaRegistro: hace30Dias, totalPedidos: 5, totalGastado: 4890 },
      { id: 3, nombre: 'Ana López', email: 'ana@email.com', fechaRegistro: hace15Dias, totalPedidos: 2, totalGastado: 2850 },
      { id: 4, nombre: 'Carlos Ruiz', email: 'carlos@email.com', fechaRegistro: hace15Dias, totalPedidos: 1, totalGastado: 750 },
      { id: 5, nombre: 'Laura Martínez', email: 'laura@email.com', fechaRegistro: hace7Dias, totalPedidos: 2, totalGastado: 2480 },
      { id: 6, nombre: 'Pedro Sánchez', email: 'pedro@email.com', fechaRegistro: hace7Dias, totalPedidos: 1, totalGastado: 920 }
    ];

    this.productos = [
      { id: 1, nombre: 'Blusa Bordada Rosa Mexicano', descripcion: 'Bordado a mano', precio: 450, stock: 12, categoria: 'Blusas', imagenes: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800'], tallas: ['S', 'M', 'L'] },
      { id: 2, nombre: 'Rebozo Tradicional Multicolor', descripcion: 'Tejido a mano', precio: 580, stock: 8, categoria: 'Rebozos', imagenes: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800'], tallas: ['Única'] },
      { id: 3, nombre: 'Vestido Chilac Flores', descripcion: 'Bordado artesanal', precio: 890, stock: 3, categoria: 'Vestidos', imagenes: ['https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800'], tallas: ['M', 'L', 'XL'] }
    ];
  }
}

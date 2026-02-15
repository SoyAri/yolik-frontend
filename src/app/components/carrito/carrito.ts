import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

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
export class Carrito implements OnInit {
  ui = inject(UiService);

  // Datos de envío
  shippingData: ShippingData = {
    nombre: '',
    telefono: '',
    calle: '',
    colonia: '',
    ciudad: '',
    codigoPostal: '',
    estado: '',
    referencias: ''
  };

  // Carrito (mock data)
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Blusa Bordada Rosa Mexicano',
      description: 'Bordado a mano con hilos de seda',
      price: 450,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
      size: 'M',
      color: 'Rosa Mexicano'
    },
    {
      id: 2,
      name: 'Rebozo Tradicional Multicolor',
      description: 'Tejido a mano 100% algodón',
      price: 580,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800',
      size: 'Única',
      color: 'Multicolor'
    },
    {
      id: 3,
      name: 'Vestido Chilac Flores',
      description: 'Bordado artesanal premium',
      price: 890,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800',
      size: 'L',
      color: 'Azul Flores'
    }
  ];

  discountCode = '';
  discountApplied = false;
  discountAmount = 0;
  shippingCost = 120;
  freeShippingThreshold = 1500;

  ngOnInit() {
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);
  }

  get subtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  get shipping(): number {
    return this.subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost;
  }

  get total(): number {
    return this.subtotal + this.shipping - this.discountAmount;
  }

  get itemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      item.quantity = newQuantity;
    }
  }

  removeItem(itemId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  applyDiscount() {
    if (this.discountCode.toLowerCase() === 'yolik2026') {
      this.discountApplied = true;
      this.discountAmount = this.subtotal * 0.1;
    }
  }

  removeDiscount() {
    this.discountApplied = false;
    this.discountAmount = 0;
    this.discountCode = '';
  }

  proceedToCheckout() {
    const pedido = {
      items: this.cartItems,
      shippingData: this.shippingData,
      subtotal: this.subtotal,
      shipping: this.shipping,
      discount: this.discountAmount,
      total: this.total,
      fecha: new Date()
    };

    console.log('Procesando pedido:', pedido);

    // CONECTAR CON BACKEND
    // this.pedidosService.crear(pedido).subscribe({
    //   next: (response) => {
    //     this.router.navigate(['/pago', response.pedidoId]);
    //   },
    //   error: (err) => {
    //     console.error('Error:', err);
    //     alert('Error al procesar el pedido');
    //   }
    // });

    alert('¡Pedido procesado!\n\nEnvío a: ' + this.shippingData.calle + ', ' + this.shippingData.ciudad + '\nTotal: $' + this.total);
  }

  clearCart() {
    if (confirm('¿Estás segura de vaciar el carrito?')) {
      this.cartItems = [];
    }
  }
}

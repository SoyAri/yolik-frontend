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

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  ui = inject(UiService);

  // TODO: Estos datos vendrán del backend / servicio compartido
  // Por ahora usamos mock data
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
      name: 'Vestido Tehuacán Flores',
      description: 'Bordado artesanal premium',
      price: 890,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800',
      size: 'L',
      color: 'Azul Flores'
    }
  ];

  // Código de descuento (futuro backend)
  discountCode = '';
  discountApplied = false;
  discountAmount = 0;

  // Costos de envío (mock - vendrá del backend)
  shippingCost = 120;
  freeShippingThreshold = 1500;

  ngOnInit() {
    // Configurar UI
    this.ui.cartVisible.set(false);
    this.ui.searchVisible.set(false);
  }

  // Computed properties
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

  // Métodos del carrito
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

  // TODO: Aplicar cupón (backend)
  applyDiscount() {
    if (this.discountCode.toLowerCase() === 'yolik2026') {
      this.discountApplied = true;
      this.discountAmount = this.subtotal * 0.1; // 10% descuento
    }
  }

  removeDiscount() {
    this.discountApplied = false;
    this.discountAmount = 0;
    this.discountCode = '';
  }

  // TODO: Procesar compra (backend)
  proceedToCheckout() {
    console.log('Procediendo al pago...', {
      items: this.cartItems,
      subtotal: this.subtotal,
      shipping: this.shipping,
      discount: this.discountAmount,
      total: this.total
    });
    // Aquí irá la navegación a la página de checkout
    alert('¡Función de pago en desarrollo! 🛍️');
  }

  clearCart() {
    if (confirm('¿Estás segura de vaciar el carrito?')) {
      this.cartItems = [];
    }
  }
}

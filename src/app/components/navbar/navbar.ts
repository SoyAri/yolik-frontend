import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiService } from '../../services/ui';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  ui = inject(UiService);

  // Estado del carrito
  isCartOpen = false;

  // Items del carrito (datos de prueba - después vienen del backend)
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Blusa Bordada Rosa',
      description: 'Bordado a mano',
      price: 450,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800'
    },
    {
      id: 2,
      name: 'Rebozo Tradicional',
      description: 'Tejido a mano',
      price: 580,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800'
    }
  ];

  // Computed properties
  get cartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Métodos del carrito
  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
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

  // TODO: Conectar con el backend
  // addToCart(product: any) {
  //   const existingItem = this.cartItems.find(item => item.id === product.id);
  //   if (existingItem) {
  //     existingItem.quantity++;
  //   } else {
  //     this.cartItems.push({
  //       id: product.id,
  //       name: product.name,
  //       description: product.description,
  //       price: product.price,
  //       quantity: 1,
  //       image: product.image
  //     });
  //   }
  // }
}

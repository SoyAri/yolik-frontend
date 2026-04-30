import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UiService } from '../../services/ui';
import { CarritoService } from '../../services/cartitem';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  ui = inject(UiService);
  carrito = inject(CarritoService);
  platformId = inject(PLATFORM_ID);
  auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : null;

  isCartOpen = false;
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  get cartItems() {
    return this.carrito.itemsDetalle();
  }

  get cartItemCount(): number {
    return this.carrito.cantidad;
  }

  get cartTotal(): number {
    return this.carrito.total;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  updateQuantity(itemId: string, newQuantity: number) {
    this.carrito.actualizarCantidad(itemId, newQuantity);
  }

  removeItem(itemId: string) {
    this.carrito.quitarProducto(itemId);
  }

  login() {
    this.auth?.loginWithRedirect();
  }

  logout() {
    this.auth?.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}

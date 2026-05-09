import { Injectable, signal, WritableSignal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  visible: WritableSignal<boolean>;
  exact?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  private platformId = inject(PLATFORM_ID);
  private auth = isPlatformBrowser(this.platformId) ? inject(AuthService) : undefined;

  visible = signal(true);
  isLoggedIn = signal(false);
  userName = signal('');
  isAdmin = signal(false);

  readonly menuItems: NavItem[] = [
    { id: 'blog', label: 'Sobre nosotros', path: '/', visible: signal(true), exact: true },
    { id: 'tienda', label: 'Tienda', path: '/tienda', visible: signal(true) },
    { id: 'administracion', label: 'Administración', path: '/administracion', visible: signal(true) },
  ];

  searchVisible = signal(true);
  cartVisible = signal(true);
  profileVisible = signal(true);

  constructor() {
    if (this.auth) {
      this.auth.isAuthenticated$.subscribe(isAuth => {
        this.isLoggedIn.set(isAuth);
      });

      this.auth.user$.subscribe(user => {
        if (user) {
          this.userName.set(user.name ?? user.email ?? '');

          // IMPORTANTE: Lee los roles expuestos desde Auth0 Actions
          const roles = user['https://yolik.mx/roles'] || [];

          // Verifica si el arreglo contiene el rol 'admin'
          if (Array.isArray(roles) && roles.includes('admin')) {
            this.isAdmin.set(true);
          } else {
            this.isAdmin.set(false);
          }

        } else {
          this.userName.set('');
          this.isAdmin.set(false);
        }
      });
    }
  }

  toggleSection(id: string, state: boolean) {
    const item = this.menuItems.find(m => m.id === id);
    if (item) item.visible.set(state);
  }

  reset() {
    this.visible.set(true);
    this.searchVisible.set(true);
    this.cartVisible.set(true);
    this.profileVisible.set(true);
    this.menuItems.forEach(item => item.visible.set(true));
  }
}

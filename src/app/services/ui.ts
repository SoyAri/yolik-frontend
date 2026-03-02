import { Injectable, signal, WritableSignal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  private http = isPlatformBrowser(this.platformId) ? inject(HttpClient) : undefined;

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
    if (this.auth && this.http) {
      this.auth.isAuthenticated$.subscribe(isAuth => {
        this.isLoggedIn.set(isAuth);
        if (isAuth) {
          this.auth!.getAccessTokenSilently().subscribe({
            next: (token) => {
              if (token) {
                this.http!.get<any>('/api/auth/admin-check', {
                  headers: new HttpHeaders({
                    Authorization: `Bearer ${token}`
                  })
                }).subscribe({
                  next: (res) => this.isAdmin.set(
                    res.role === 'admin' ||
                    (Array.isArray(res.roles) && res.roles.includes('admin')) ||
                    (Array.isArray(res.permissions) && res.permissions.includes('read:dashboard'))
                  ),
                  error: () => this.isAdmin.set(false)
                });
              } else {
                this.isAdmin.set(false);
              }
            },
            error: () => this.isAdmin.set(false)
          });
        } else {
          this.isAdmin.set(false);
        }
      });
      this.auth.user$.subscribe(user => {
        if (user) {
          this.userName.set(user.name ?? user.email ?? '');
        } else {
          this.userName.set('');
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

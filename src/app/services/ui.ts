import { Injectable, signal, WritableSignal } from '@angular/core';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  visible: WritableSignal<boolean>;
  exact?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  visible = signal(true);
  isLoggedIn = signal(true);
  userName = signal('Usuario YOLIK');

  // Secciones de navegación
  readonly menuItems: NavItem[] = [
    { id: 'blog', label: 'Blog', path: '/', visible: signal(true), exact: true },
    { id: 'tienda', label: 'Tienda', path: '/tienda', visible: signal(true) },
    { id: 'administracion', label: 'Administración', path: '/administracion', visible: signal(true) },
  ];

  // Herramientas (Signals individuales para evitar el error 'sections')
  searchVisible = signal(true);
  cartVisible = signal(true);
  profileVisible = signal(true);

  // Método modular para apagar/prender links
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

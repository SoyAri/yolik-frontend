import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { UiService } from './services/ui';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html'
})
export class App {
  ui = inject(UiService);
  router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((e: any) => {
      // Si la URL es login o registro, el navbar se esfuma
      const isAuth = e.url.includes('/login') || e.url.includes('/registro');
      this.ui.visible.set(!isAuth);
    });
  }
}

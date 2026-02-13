import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { UiService } from '../../services/ui';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, BadgeModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit, OnDestroy {
  ui = inject(UiService);

  posts = [
    { id: 1, titulo: 'Bordados Tradicionales', extracto: 'La esencia de Tehuacán...', img: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800', tag: 'Cultura' },
    { id: 2, titulo: 'Moda Artesanal', extracto: 'Tradición y modernidad.', img: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800', tag: 'Tendencias' }
  ];

  ngOnInit() {
    // Si quieres que la TIENDA aparezca, asegúrate de que esté en true
    this.ui.toggleSection('tienda', true);

    // Apagamos las herramientas que no queremos en el blog
    this.ui.searchVisible.set(false);
    this.ui.cartVisible.set(false);
  }

  ngOnDestroy() {
    this.ui.reset();
  }
}

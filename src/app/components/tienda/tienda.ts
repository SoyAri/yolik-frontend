import { Component, OnInit } from '@angular/core';
import { UiService } from '../../services/ui';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// 1. Definimos las interfaces para corregir el error de TypeScript
interface Badge {
  text: string;
  color: string;
  position?: string; // El ? hace que esta propiedad sea opcional y evita el error
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  descripcion: string;
  imagen: string;
  badges: Badge[];
  agotado?: boolean;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class Tienda implements OnInit {
  // 2. Aplicamos el tipo Producto[] al array para validar los datos
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Blusa Bordada Rosa Mexicano',
      precio: 450,
      descripcion: 'Bordado a mano',
      imagen: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 2,
      nombre: 'Rebozo Tradicional Multicolor',
      precio: 580,
      descripcion: 'Tejido a mano',
      imagen: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 3,
      nombre: 'Vestido Tehuacán Flores',
      precio: 890,
      descripcion: 'Bordado artesanal',
      imagen: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800',
      badges: [{ text: 'Pocas unidades', color: 'bg-yellow-500' }]
    },
    {
      id: 4,
      nombre: 'Huipil Tradicional Azul',
      precio: 720,
      descripcion: '100% algodón',
      imagen: 'https://images.unsplash.com/photo-1558769132-cb1aea8f1cf5?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 5,
      nombre: 'Falda Bordada Tehuacán',
      precio: 650,
      descripcion: 'Edición limitada',
      imagen: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800',
      badges: [{ text: 'Agotado', color: 'bg-red-500' }],
      agotado: true
    },
    {
      id: 6,
      nombre: 'Blusa Flores Primavera',
      precio: 520,
      descripcion: 'Colección nueva',
      imagen: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
      badges: [
        { text: 'Nuevo', color: 'bg-[#D11C5E]', position: 'left' },
        { text: 'En stock', color: 'bg-green-500', position: 'right' }
      ]
    },
    {
      id: 7,
      nombre: 'Vestido Largo Ceremonial',
      precio: 1250,
      descripcion: 'Eventos especiales',
      imagen: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 8,
      nombre: 'Rebozo Negro Elegante',
      precio: 680,
      descripcion: 'Seda y algodón',
      imagen: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800',
      badges: [{ text: 'Pocas unidades', color: 'bg-yellow-500' }]
    },
    {
      id: 9,
      nombre: 'Conjunto Bordado 2 Piezas',
      precio: 980,
      descripcion: 'Blusa + Falda',
      imagen: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 10,
      nombre: 'Blusa Casual Diaria',
      precio: 380,
      descripcion: 'Uso cotidiano',
      imagen: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    },
    {
      id: 11,
      nombre: 'Vestido Fiesta Gala',
      precio: 1100,
      precioOriginal: 1500,
      descripcion: 'Bordado premium',
      imagen: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=800',
      badges: [
        { text: 'Oferta', color: 'bg-orange-500', position: 'left' },
        { text: 'En stock', color: 'bg-green-500', position: 'right' }
      ]
    },
    {
      id: 12,
      nombre: 'Blusa Tradicional Bordada',
      precio: 490,
      descripcion: 'Diseño clásico',
      imagen: 'https://images.unsplash.com/photo-1558769132-cb1aea8f1cf5?q=80&w=800',
      badges: [{ text: 'En stock', color: 'bg-green-500' }]
    }
  ];

  constructor(public ui: UiService) {}

  ngOnInit() {
    this.ui.cartVisible.set(true);
    this.ui.searchVisible.set(false);
  }
}

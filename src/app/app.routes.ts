import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Blog } from './components/blog/blog';
import { Tienda } from './components/tienda/tienda';
import { Administracion } from './components/administracion/administracion';
import { DetalleProducto } from './components/detalle-producto/detalle-producto';

export const routes: Routes = [
  // ruta por defecto cuando el path esté vacio
  { path: '', component: Blog, pathMatch: 'full' },

  { path: 'login', component: Login },

  { path: 'registro', component: Registro },

  { path: 'tienda', component: Tienda },

  { path: 'detalle-producto/:id', component: DetalleProducto },

  { path: 'administracion', component: Administracion },

  // ruta para manejar rutas no definidas
  { path: '**', redirectTo: '' }
];

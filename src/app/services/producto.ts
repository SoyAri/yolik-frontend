import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  _id: string;
  name: string;
  description: string;
  region: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  sku?: string;
  active: boolean;
  stockStatus: string;
  discount?: number;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface ProductosResponse {
  count: number;
  total: number;
  page: number;
  totalPages: number;
  products: Producto[];
}

export interface ProductosFiltros {
  page?: number;
  limit?: number;
  category?: string;
  region?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/products`;

  getProductos(filtros: ProductosFiltros = {}): Observable<ProductosResponse> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros.category) params = params.set('category', filtros.category);
    if (filtros.region) params = params.set('region', filtros.region);
    if (filtros.search) params = params.set('search', filtros.search);
    return this.http.get<ProductosResponse>(this.apiUrl, { params });
  }

  getProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }
}

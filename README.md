<div align="center">

# 🛍️ Yolik

### E-commerce de Ropa Típica Regional

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-00796B?style=for-the-badge&logo=prime&logoColor=white)](https://primeng.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Descripción

Aplicación web para **Yolik**, un negocio dedicado a la venta de ropa típica regional. La plataforma está inspirada en el modelo de e-commerce moderno similar a **Shein**, pero adaptada al mercado local y enfocada en promover la cultura y tradición a través de la vestimenta regional.

---

## ✨ Alcance Funcional

### 🏠 1. Página Informativa
> **Acceso:** Público

Carta de presentación del negocio con información institucional sobre Yolik, su historia, misión y el valor cultural de la ropa típica. Incluye galería fotográfica con imágenes publicitarias de alta calidad.

### 🛒 2. Tienda en Línea
> **Acceso:** Visualización pública | Compra requiere autenticación

Catálogo completo de productos con información detallada:
- Fotografías del producto
- Descripción
- Precio
- Tallas disponibles
- Inventario en tiempo real

Los usuarios pueden visualizar el catálogo, pero deben iniciar sesión para agregar productos al carrito.

### 🛍️ 3. Carrito de Compras
> **Acceso:** Exclusivo para usuarios autenticados

Gestión de productos seleccionados con opciones para:
- Ajustar cantidades
- Eliminar productos
- Ver el subtotal en tiempo real
- **Persistencia entre sesiones**

### 💳 4. Proceso de Compra
> **Acceso:** Exclusivo para usuarios autenticados

Guía al usuario a través de:
- Confirmación de pedido
- Verificación de dirección de envío
- Selección de método de pago
- Confirmación final de la orden

### 📊 5. Dashboard Administrativo
> **Acceso:** Exclusivo para usuarios con rol de administrador

Panel de control para administradores con herramientas para:
- 📦 Monitorear pedidos y su estado
- 🏷️ Gestionar catálogo de productos (agregar, editar, eliminar)
- 📈 Actualizar inventario, precios y disponibilidad
- 👥 Administrar cuentas de usuarios
- 📋 Acceder a reportes de ventas detallados

---

## 🏗️ Arquitectura Frontend

### 🔧 Tecnología Base

**Angular 21** con:
- Standalone components
- Signals
- Sistema de enrutamiento

---

## 🗺️ Estructura de Rutas

### 🌐 Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio/Landing page |
| `/blog` | Información del negocio (historia, misión, galería) |
| `/tienda` | Catálogo de productos con visualización y detalle |
| `/login` | Inicio de sesión |
| `/registro` | Registro de nuevos usuarios |
| `/recuperar-acceso` | Recuperación de contraseña |

### 🔒 Rutas Protegidas
*Requieren autenticación*

| Ruta | Descripción |
|------|-------------|
| `/carrito` | Carrito de compras (visualizar, modificar, procesar compra) |
| `/perfil` | Perfil de usuario (visualizar, editar datos, cambiar contraseña) |

### 👨‍💼 Rutas Administrativas
*Solo para administradores*

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel administrativo completo (gestión de productos, pedidos, usuarios, reportes) |

---

## 🛡️ Guards

| Guard | Protege | Acción |
|-------|---------|--------|
| **AuthGuard** | `/carrito`, `/perfil` | Redirige a `/login` si no autenticado |
| **AdminGuard** | `/dashboard` | Verifica rol de administrador, redirige a `/` si no es admin |

---

## 📦 Dependencias del Proyecto

### 🎨 UI Library

#### PrimeNG
Componentes funcionales principales:

**Formularios**
- `p-inputText` - Campos de texto
- `p-password` - Campos de contraseña con indicador de fortaleza
- `p-dropdown` - Selectores desplegables
- `p-checkbox` - Casillas de verificación
- `p-calendar` - Selector de fechas
- `p-inputNumber` - Entrada numérica con controles

**Presentación de Datos**
- `p-card` - Tarjetas para productos e información
- `p-table` - Tablas avanzadas con paginación, ordenamiento y filtros
- `p-dataView` - Vista de datos en grid o lista
- `p-badge` - Etiquetas pequeñas
- `p-tag` - Etiquetas de estado

**Navegación**
- `p-menubar` - Barra de menú principal
- `p-sidebar` - Panel lateral deslizable
- `p-tabView` - Pestañas
- `p-breadcrumb` - Migas de pan

**Feedback y Diálogos**
- `p-toast` - Notificaciones
- `p-dialog` - Modales
- `p-confirmDialog` - Diálogos de confirmación
- `p-progressSpinner` - Indicador de carga
- `p-skeleton` - Placeholder de carga

**Botones y Acciones**
- `p-button` - Botones con iconos y estados
- `p-splitButton` - Botón con menú desplegable

**Visualización Avanzada**
- `p-carousel` - Carrusel de imágenes
- `p-galleria` - Galería de imágenes
- `p-chart` - Gráficas para estadísticas

#### Tailwind CSS
Framework de CSS para diseño visual mediante clases utilitarias:
- Layout y espaciado
- Tipografía
- Colores y fondos
- Efectos y transiciones
- Responsive design

#### DaisyUI
Plugin de Tailwind CSS para componentes prediseñados:

| Categoría | Componentes |
|-----------|-------------|
| **Navegación** | navbar, btn-ghost |
| **Básicos** | badge, avatar, divider |
| **Feedback** | alert, loading |
| **Formularios** | input, toggle |

---

## 🔄 Manejo de Estado

**Angular Signals + Services**

Sistema nativo de Angular 21 para gestionar el estado de forma reactiva.

---

## 🔐 Autenticación

### JWT (JSON Web Tokens)

Sistema de autenticación basado en tokens.

#### Responsabilidades del Frontend:

- ✅ Recibir el token JWT después de login exitoso
- 💾 Almacenar el token en localStorage
- 📤 Incluir el token en el header de cada petición HTTP
- ⏱️ Verificar localmente si el token ha expirado
- 🗑️ Eliminar el token al cerrar sesión
- 🔓 Decodificar el payload del token para obtener información del usuario

#### Dependencia:

**@auth0/angular-jwt**

Biblioteca para manejo de JWT que proporciona:
- Interceptor automático para agregar token a peticiones
- Decodificación de tokens
- Verificación de expiración
- Configuración flexible

---

## 🌐 Comunicación con Backend

### API REST con HttpClient

Módulo nativo de Angular para comunicación HTTP/HTTPS en formato JSON.

#### Métodos HTTP:

| Método | Uso |
|--------|-----|
| **GET** | Obtener recursos |
| **POST** | Crear nuevos recursos |
| **PUT** | Actualizar recursos completos |
| **PATCH** | Actualizar recursos parcialmente |
| **DELETE** | Eliminar recursos |

#### Interceptores:

- **AuthInterceptor** - Agrega automáticamente token JWT a peticiones
- **ErrorInterceptor** - Maneja errores HTTP globalmente (401, 403, 404, 500)

---

## 🎨 Iconos

**PrimeIcons**

Biblioteca oficial de iconos de PrimeNG con más de 250 iconos vectoriales.

---

## 📊 Resumen de Dependencias

| Tipo | Cantidad | Bibliotecas |
|------|----------|-------------|
| **UI** | 3 | PrimeNG, Tailwind CSS, DaisyUI |
| **Autenticación** | 1 | @auth0/angular-jwt |
| **Iconos** | 1 | primeicons |
| **Comunicación** | 0 | HttpClient (nativo de Angular) |
| **Estado** | 0 | Signals (nativo de Angular) |

**Total:** 5 dependencias externas

---

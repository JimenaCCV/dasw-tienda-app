# DASW Tienda App

Proyecto de tienda en línea desarrollado para la materia **Desarrollo de Aplicaciones y Servicios Web (DASW)** — ITESO, Semestre 4.

## Estructura del proyecto

```
DASW-tienda-app/
├── practica3_backend/   # API REST con Node.js y Express
└── practica4_frontend/  # Interfaz de usuario con HTML, CSS y JavaScript vanilla
```

## Backend — `practica3_backend`

API REST para gestionar productos y carrito de compras.

**Tecnologías:** Node.js · Express 5 · CORS

**Instalación y ejecución:**

```bash
cd practica3_backend
npm install
npm run dev
```

El servidor corre en `http://localhost:3100`.

**Endpoints principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| GET | `/api/cart` | Ver carrito |
| POST | `/api/cart` | Agregar al carrito |

## Frontend — `practica4_frontend`

Interfaz web que consume la API del backend.

**Tecnologías:** HTML5 · JavaScript · Bootstrap 4

**Páginas:**

- `home.html` — Catálogo de productos con búsqueda
- `admin.html` — Panel de administración (CRUD de productos)
- `shopping_cart.html` — Carrito de compras

**Uso:** Abre cualquier archivo `.html` directamente en el navegador con el backend corriendo.

## Autora

Jimena Corona — ITESO

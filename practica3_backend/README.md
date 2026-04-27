# Práctica 3 — API REST E-Commerce

API REST para una tienda en línea construida con Node.js y Express. Permite gestionar productos y carritos de compra, con control de acceso diferenciado entre usuarios normales y administradores.

---

## Tecnologías utilizadas

- **Node.js** con ES Modules
- **Express 5**
- **shortid** — generación de IDs únicos para productos
- **JSON** como base de datos local (`products.json` y `cart.json`)

---

## Cómo correr el proyecto

```bash
npm install
node server.js
```

El servidor queda disponible en `http://localhost:3100`.

---

## Arquitectura

El proyecto sigue una arquitectura en capas:

```
practica3/
├── server.js                          # Punto de entrada, configuración de Express
├── routes/
│   └── product.api.route.js           # Definición de rutas y middlewares por ruta
├── controller/
│   └── product.controller.js          # Recibe la petición y devuelve la respuesta
├── services/
│   └── product.service.js             # Lógica de negocio y validaciones
├── repositories/
│   └── product.repository.js          # Lectura y escritura en los archivos JSON
├── middlewares/
│   ├── validateUser.middleware.js      # Valida que venga el header x-user
│   └── validateAdmin.middleware.js     # Valida que x-auth sea "admin"
├── products.json                       # Base de datos de productos
└── cart.json                           # Base de datos de carritos por usuario
```

---

## Autenticación

La API usa headers personalizados para identificar al usuario y sus permisos:

| Header | Valor esperado | Uso |
|--------|---------------|-----|
| `x-user` | cualquier nombre | identifica al usuario (rutas de usuario) |
| `x-auth` | `admin` | acceso a rutas de administrador |

---

## Endpoints

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | `x-user` | Lista todos los productos. Admin también ve el campo `stock`. |
| GET | `/api/products/:id` | ninguna | Obtiene un producto por ID. |
| POST | `/api/products` | `x-auth: admin` | Crea un producto nuevo. |
| PUT | `/api/products/:id` | `x-auth: admin` | Actualiza un producto existente (reemplazo completo). |
| DELETE | `/api/products/:id` | `x-auth: admin` | Elimina un producto. |

### Carrito

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products/cart` | `x-user` | Devuelve los productos del carrito del usuario con total. |
| POST | `/api/products/cart` | `x-user` | Reemplaza el carrito del usuario con los IDs enviados. |

---

## Ejemplos de uso

### Obtener todos los productos (usuario normal)

```http
GET http://localhost:3100/api/products
x-user: jimena
```

### Obtener todos los productos (admin, con stock)

```http
GET http://localhost:3100/api/products
x-user: jimena
x-auth: admin
```

### Filtrar productos por rango de precio

```http
GET http://localhost:3100/api/products?min=20&max=50
x-user: jimena
```

### Obtener carrito del usuario

```http
GET http://localhost:3100/api/products/cart
x-user: jimena
```

### Agregar productos al carrito

```http
POST http://localhost:3100/api/products/cart
x-user: jimena
Content-Type: application/json

["abc123", "ghi789"]
```

### Crear un producto (admin)

```http
POST http://localhost:3100/api/products
x-auth: admin
Content-Type: application/json

{
  "title": "Aguacate Hass",
  "description": "Aguacate fresco",
  "unit": "pieza",
  "category": "fruta",
  "pricePerUnit": 18.5,
  "stock": 90
}
```

### Eliminar un producto (admin)

```http
DELETE http://localhost:3100/api/products/abc123
x-auth: admin
```

---

## Campos requeridos al crear o actualizar un producto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | string | Nombre del producto |
| `description` | string | Descripción del producto |
| `unit` | string | Unidad de medida (ej. pieza, kg, litro) |
| `category` | string | Categoría del producto |
| `pricePerUnit` | number | Precio por unidad |
| `stock` | number | Cantidad disponible |

> El `id` es generado automáticamente por el servidor, no se debe enviar en el body.

---

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Producto creado exitosamente |
| 400 | Datos inválidos o faltantes en el body |
| 403 | Sin autorización (falta header requerido) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Pruebas con REST Client

El archivo `requests.http` incluye ejemplos de todas las rutas con casos de éxito y error. Para usarlo instala la extensión **REST Client** en VS Code.

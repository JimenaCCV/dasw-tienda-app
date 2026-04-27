// --- Autenticación ---

function obtenerUsuario() {
    return localStorage.getItem("usuario");
}

function actualizarNavbar() {
    const usuario = obtenerUsuario();
    const li = document.getElementById("navbarUser");
    if (!li) return;

    if (usuario) {
        li.innerHTML = `
            <a class="nav-item nav-link dropdown-toggle mr-2" href="#" data-toggle="dropdown">
                Hola, ${usuario}
            </a>
            <div class="dropdown-menu dropdown-menu-right">
                <span class="dropdown-item-text text-muted small">Sesión activa</span>
                <a class="dropdown-item" href="admin.html">
                    <i class="fas fa-cog"></i> Administración
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" href="#" id="btnCerrarSesion">
                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                </a>
            </div>`;
        document.getElementById("btnCerrarSesion").addEventListener("click", e => {
            e.preventDefault();
            localStorage.removeItem("usuario");
            window.location.href = "home.html";
        });
    } else {
        li.innerHTML = `
            <a class="nav-item nav-link mr-2" href="home.html">Mi Cuenta</a>`;
    }
}

// --- Carrito (localStorage) ---

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarBadge();
    renderCarrito();
}

function eliminarItem(id) {
    const carrito = obtenerCarrito().filter(item => item.id !== id);
    guardarCarrito(carrito);
}

function actualizarCantidad(id, cantidad) {
    if (cantidad < 1) {
        eliminarItem(id);
        return;
    }
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex(item => item.id === id);
    if (idx < 0) return;
    carrito[idx].cantidad = cantidad;
    guardarCarrito(carrito);
}

function actualizarBadge() {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = total;
}

// --- Renderizado ---

function crearItemHTML(item) {
    const subtotal = (item.price * item.cantidad).toFixed(2);
    const imgTag = item.image
        ? `<img src="${item.image}" alt="${item.title}"
               class="mr-3 rounded" style="width:70px;height:70px;object-fit:contain;flex-shrink:0;">`
        : `<div class="mr-3 bg-light d-flex align-items-center justify-content-center rounded"
               style="width:70px;height:70px;flex-shrink:0;">
               <i class="fas fa-box fa-2x text-secondary"></i>
           </div>`;
    return `
        <div class="cart-item d-flex align-items-center" data-id="${item.id}">
            ${imgTag}
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.title}</h6>
                <small class="text-muted">${item.category}</small>
                <p class="mb-0">$${item.price} c/u</p>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm btn-menos" data-id="${item.id}">-</button>
                <input type="number" class="form-control qty-input mx-1 text-center"
                    value="${item.cantidad}" min="1" data-id="${item.id}" style="width:65px;" />
                <button class="btn btn-outline-secondary btn-sm btn-mas" data-id="${item.id}">+</button>
            </div>
            <div class="ml-3 text-right" style="min-width:85px;">
                <p class="mb-1 font-weight-bold">$${subtotal}</p>
                <button class="btn btn-danger btn-sm btn-eliminar" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function renderCarrito() {
    const carrito = obtenerCarrito();
    const lista = document.getElementById("listaCarrito");
    const resumen = document.getElementById("resumenItems");
    const totalEl = document.getElementById("totalCompra");

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="text-center mt-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h5 class="text-muted">Tu carrito está vacío</h5>
                <a href="home.html" class="btn btn-primary mt-2">Ir a la tienda</a>
            </div>`;
        resumen.innerHTML = "";
        totalEl.textContent = "$0.00";
        return;
    }

    lista.innerHTML = carrito.map(crearItemHTML).join("");

    resumen.innerHTML = carrito.map(item =>
        `<li class="list-group-item d-flex justify-content-between px-0">
            <span>${item.title} <span class="badge badge-secondary">x${item.cantidad}</span></span>
            <span>$${(item.price * item.cantidad).toFixed(2)}</span>
        </li>`
    ).join("");

    const total = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    totalEl.textContent = `$${total.toFixed(2)}`;

    // Eventos
    lista.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarItem(btn.dataset.id));
    });

    lista.querySelectorAll(".btn-menos").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = carrito.find(i => i.id === btn.dataset.id);
            if (item) actualizarCantidad(btn.dataset.id, item.cantidad - 1);
        });
    });

    lista.querySelectorAll(".btn-mas").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = carrito.find(i => i.id === btn.dataset.id);
            if (item) actualizarCantidad(btn.dataset.id, item.cantidad + 1);
        });
    });

    lista.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", () => {
            const cantidad = parseInt(input.value, 10);
            actualizarCantidad(input.dataset.id, isNaN(cantidad) ? 1 : cantidad);
        });
    });
}

document.getElementById("btnVaciarCarrito").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
        guardarCarrito([]);
    }
});

actualizarNavbar();
actualizarBadge();
renderCarrito();

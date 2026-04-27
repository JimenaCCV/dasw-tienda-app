const API_URL = "http://localhost:3100/api";
const PRODUCTOS_POR_PAGINA = 4;

let paginaActual = 1;
let todosLosProductos = [];
let terminoBusqueda = "";

// --- Autenticación (localStorage) ---

function obtenerUsuario() {
    return localStorage.getItem("usuario");
}

function guardarUsuario(nombre) {
    localStorage.setItem("usuario", nombre);
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    actualizarNavbar();
    mostrarMensajeLogin();
}

function obtenerHeaders() {
    const usuario = obtenerUsuario();
    return {
        "x-auth": "admin",
        "x-user": usuario || ""
    };
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
        document.getElementById("btnCerrarSesion")
            .addEventListener("click", e => { e.preventDefault(); cerrarSesion(); });
    } else {
        li.innerHTML = `
            <a class="nav-item nav-link dropdown-toggle mr-2" href="#" data-toggle="dropdown">
                Mi Cuenta
            </a>
            <div class="dropdown-menu dropdown-menu-right">
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#login">Ingresar</a>
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#signup">Registro</a>
            </div>`;
    }
}

// --- Modales de auth ---

function iniciarSesion() {
    const usuario = document.getElementById("loginUsuario").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    if (!usuario) {
        errorEl.textContent = "Ingresa tu nombre de usuario.";
        errorEl.classList.remove("d-none");
        return;
    }
    if (!password) {
        errorEl.textContent = "Ingresa tu contraseña.";
        errorEl.classList.remove("d-none");
        return;
    }

    guardarUsuario(usuario);
    errorEl.classList.add("d-none");
    document.getElementById("loginUsuario").value = "";
    document.getElementById("loginPassword").value = "";
    $("#login").modal("hide");
    actualizarNavbar();
    cargarProductos();
}

function registrarse() {
    const usuario = document.getElementById("signupUsuario").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    const errorEl = document.getElementById("signupError");

    if (!usuario) {
        errorEl.textContent = "Elige un nombre de usuario.";
        errorEl.classList.remove("d-none");
        return;
    }
    if (!password) {
        errorEl.textContent = "Ingresa una contraseña.";
        errorEl.classList.remove("d-none");
        return;
    }
    if (password !== confirm) {
        errorEl.textContent = "Las contraseñas no coinciden.";
        errorEl.classList.remove("d-none");
        return;
    }

    guardarUsuario(usuario);
    errorEl.classList.add("d-none");
    document.getElementById("signupUsuario").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupConfirm").value = "";
    $("#signup").modal("hide");
    actualizarNavbar();
    cargarProductos();
}

document.getElementById("btnLogin").addEventListener("click", iniciarSesion);
document.getElementById("btnSignup").addEventListener("click", registrarse);

// Permitir Enter en los campos de login
document.getElementById("loginPassword").addEventListener("keydown", e => {
    if (e.key === "Enter") iniciarSesion();
});
document.getElementById("signupConfirm").addEventListener("keydown", e => {
    if (e.key === "Enter") registrarse();
});

// --- Carrito (localStorage) ---

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarBadge();
}

function agregarAlCarrito(producto, cantidad) {
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex(item => item.id === producto.id);
    if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }
    guardarCarrito(carrito);
}

function actualizarBadge() {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = total;
}

// --- Modal carrito ---

function abrirModal(producto) {
    document.getElementById("modalNombre").textContent = producto.title;
    document.getElementById("modalCategoria").textContent = producto.category;
    document.getElementById("modalUnidad").textContent = producto.unit || "—";
    document.getElementById("modalPrecio").textContent = `$${producto.price}`;
    document.getElementById("modalCantidad").value = 1;

    const img = document.getElementById("modalImagen");
    if (producto.image) {
        img.src = producto.image;
        img.alt = producto.title;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    document.getElementById("btnConfirmarCarrito").onclick = () => {
        const cantidad = parseInt(document.getElementById("modalCantidad").value, 10);
        if (cantidad < 1) return;
        agregarAlCarrito(producto, cantidad);
        $("#modalCarrito").modal("hide");
        mostrarAlerta(`"${producto.title}" agregado al carrito.`);
    };

    $("#modalCarrito").modal("show");
}

function mostrarAlerta(mensaje) {
    const alerta = document.getElementById("alertaCarrito");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
    setTimeout(() => alerta.classList.add("d-none"), 3000);
}

// --- Renderizado ---

function crearTarjeta(producto) {
    const imgTag = producto.image
        ? `<img src="${producto.image}" class="card-img-top p-2" alt="${producto.title}"
               style="height:180px;object-fit:contain;">`
        : `<div class="d-flex align-items-center justify-content-center bg-light"
               style="height:180px;"><i class="fas fa-box fa-3x text-secondary"></i></div>`;
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100">
                ${imgTag}
                <div class="card-body">
                    <h5 class="card-title">${producto.title}</h5>
                    <p class="card-text">
                        <span class="badge badge-secondary">${producto.category}</span>
                    </p>
                    <p class="card-text font-weight-bold">$${producto.price}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-block btn-agregar" data-id="${producto.id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById("mainList");
    const tarjetas = productos.map(p => crearTarjeta(p)).join("");
    contenedor.innerHTML = `<div class="row">${tarjetas}</div>`;

    contenedor.querySelectorAll(".btn-agregar").forEach(btn => {
        const id = btn.dataset.id;
        const producto = todosLosProductos.find(p => p.id === id);
        btn.addEventListener("click", () => abrirModal(producto));
    });
}

function mostrarMensajeLogin() {
    document.getElementById("mainList").innerHTML = `
        <div class="text-center mt-5">
            <i class="fas fa-user-lock fa-4x text-muted mb-3"></i>
            <h5 class="text-muted">Inicia sesión para ver los productos</h5>
            <button class="btn btn-primary mt-2" data-toggle="modal" data-target="#login">
                Iniciar sesión
            </button>
            <button class="btn btn-outline-secondary mt-2 ml-2" data-toggle="modal" data-target="#signup">
                Crear cuenta
            </button>
        </div>`;
    document.getElementById("paginationList").innerHTML = "";
}

function renderPaginacion(totalFiltrados) {
    const totalPaginas = Math.ceil(totalFiltrados / PRODUCTOS_POR_PAGINA);
    const ul = document.getElementById("paginationList");
    ul.innerHTML = "";

    if (totalPaginas <= 1) return;

    ul.innerHTML += `
        <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${paginaActual - 1}">Anterior</a>
        </li>`;

    for (let i = 1; i <= totalPaginas; i++) {
        ul.innerHTML += `
            <li class="page-item ${i === paginaActual ? "active" : ""}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
    }

    ul.innerHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${paginaActual + 1}">Siguiente</a>
        </li>`;

    ul.querySelectorAll(".page-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const pagina = parseInt(link.dataset.page, 10);
            if (pagina >= 1 && pagina <= totalPaginas) {
                paginaActual = pagina;
                renderPagina();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });
}

function productosFiltrados() {
    if (!terminoBusqueda) return todosLosProductos;
    const q = terminoBusqueda.toLowerCase();
    return todosLosProductos.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
}

function renderResultadosBusqueda(total) {
    let etiqueta = document.getElementById("labelBusqueda");
    if (!etiqueta) {
        etiqueta = document.createElement("p");
        etiqueta.id = "labelBusqueda";
        etiqueta.className = "text-muted mt-2 mb-0 ml-1";
        document.getElementById("mainList").before(etiqueta);
    }
    if (terminoBusqueda) {
        etiqueta.innerHTML = `${total} resultado${total !== 1 ? "s" : ""} para <strong>"${terminoBusqueda}"</strong>
            <a href="#" id="limpiarBusqueda" class="ml-2 small">Limpiar</a>`;
        document.getElementById("limpiarBusqueda").addEventListener("click", e => {
            e.preventDefault();
            terminoBusqueda = "";
            document.getElementById("searchInput").value = "";
            paginaActual = 1;
            renderPagina();
        });
    } else {
        etiqueta.textContent = "";
    }
}

function renderPagina() {
    const filtrados = productosFiltrados();
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    mostrarProductos(filtrados.slice(inicio, fin));
    renderPaginacion(filtrados.length);
    renderResultadosBusqueda(filtrados.length);
}

// --- Fetch ---

async function cargarProductos() {
    if (!obtenerUsuario()) {
        mostrarMensajeLogin();
        return;
    }
    try {
        const respuesta = await fetch(`${API_URL}/products`, { headers: obtenerHeaders() });
        todosLosProductos = await respuesta.json();
        paginaActual = 1;
        renderPagina();
    } catch (err) {
        document.getElementById("mainList").innerHTML =
            `<p class="text-danger text-center mt-4">Error al cargar productos: ${err.message}</p>`;
    }
}

// --- Buscador ---

document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    terminoBusqueda = document.getElementById("searchInput").value.trim();
    paginaActual = 1;
    renderPagina();
});

// Limpiar al borrar el campo con la X del input type="search"
document.getElementById("searchInput").addEventListener("search", e => {
    if (e.target.value === "") {
        terminoBusqueda = "";
        paginaActual = 1;
        renderPagina();
    }
});

// --- Init ---
actualizarNavbar();
actualizarBadge();
cargarProductos();

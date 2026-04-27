const API_URL = "https://dasw-tienda-app-production.up.railway.app/api";

// --- Auth ---

function obtenerUsuario() {
    return localStorage.getItem("usuario");
}

function obtenerHeaders() {
    return {
        "Content-Type": "application/json",
        "x-auth": "admin",
        "x-user": obtenerUsuario() || ""
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
        window.location.href = "home.html";
    }
}

// --- Alertas ---

function mostrarAlerta(mensaje, tipo = "success") {
    const el = document.getElementById("adminAlerta");
    el.className = `alert alert-${tipo}`;
    el.textContent = mensaje;
    el.classList.remove("d-none");
    setTimeout(() => el.classList.add("d-none"), 4000);
}

// --- Tabla de productos ---

function precioProducto(p) {
    return p.price ?? p.pricePerUnit ?? 0;
}

function crearFila(producto) {
    const precio = precioProducto(producto);
    const imgTag = producto.image
        ? `<img src="${producto.image}" alt="${producto.title}"
               style="width:50px;height:50px;object-fit:contain;">`
        : `<i class="fas fa-box text-secondary"></i>`;
    return `
        <tr data-id="${producto.id}">
            <td class="text-center align-middle">${imgTag}</td>
            <td class="align-middle">${producto.title}</td>
            <td class="align-middle text-muted small">${producto.description || "—"}</td>
            <td class="align-middle">
                <span class="badge badge-secondary">${producto.category}</span>
            </td>
            <td class="align-middle">$${precio}</td>
            <td class="align-middle">${producto.unit || "—"}</td>
            <td class="align-middle">${producto.stock}</td>
            <td class="align-middle text-center">
                <button class="btn btn-sm btn-outline-primary btn-editar mr-1" data-id="${producto.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${producto.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
}

function renderTabla(productos) {
    const tbody = document.getElementById("tablaProductos");

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No hay productos.</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map(crearFila).join("");

    tbody.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => abrirModalEliminar(btn.dataset.id));
    });
}

// --- Cargar productos ---

let productosCache = [];

async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/products`, { headers: obtenerHeaders() });
        productosCache = await res.json();
        renderTabla(productosCache);
    } catch (err) {
        document.getElementById("tablaProductos").innerHTML =
            `<tr><td colspan="8" class="text-danger text-center">Error: ${err.message}</td></tr>`;
    }
}

// --- Modal crear / editar ---

function limpiarFormulario() {
    document.getElementById("productoId").value = "";
    document.getElementById("productoTitle").value = "";
    document.getElementById("productoDescription").value = "";
    document.getElementById("productoCategory").value = "";
    document.getElementById("productoPrecio").value = "";
    document.getElementById("productoUnit").value = "";
    document.getElementById("productoStock").value = "";
    document.getElementById("productoImage").value = "";
    document.getElementById("formError").classList.add("d-none");
}

function abrirModalCrear() {
    limpiarFormulario();
    document.getElementById("modalProductoTitulo").textContent = "Nuevo producto";
    $("#modalProducto").modal("show");
}

function abrirModalEditar(id) {
    const producto = productosCache.find(p => p.id === id);
    if (!producto) return;

    limpiarFormulario();
    document.getElementById("modalProductoTitulo").textContent = "Editar producto";
    document.getElementById("productoId").value = producto.id;
    document.getElementById("productoTitle").value = producto.title || "";
    document.getElementById("productoDescription").value = producto.description || "";
    document.getElementById("productoCategory").value = producto.category || "";
    document.getElementById("productoPrecio").value = precioProducto(producto);
    document.getElementById("productoUnit").value = producto.unit || "";
    document.getElementById("productoStock").value = producto.stock ?? "";
    document.getElementById("productoImage").value = producto.image || "";

    $("#modalProducto").modal("show");
}

function leerFormulario() {
    const title = document.getElementById("productoTitle").value.trim();
    const description = document.getElementById("productoDescription").value.trim();
    const category = document.getElementById("productoCategory").value.trim();
    const precio = parseFloat(document.getElementById("productoPrecio").value);
    const unit = document.getElementById("productoUnit").value.trim();
    const stock = parseInt(document.getElementById("productoStock").value, 10);
    const image = document.getElementById("productoImage").value.trim();
    const errorEl = document.getElementById("formError");

    if (!title) { mostrarFormError("El título es obligatorio."); return null; }
    if (!description) { mostrarFormError("La descripción es obligatoria."); return null; }
    if (!category) { mostrarFormError("La categoría es obligatoria."); return null; }
    if (isNaN(precio) || precio < 0) { mostrarFormError("El precio debe ser un número válido."); return null; }
    if (!unit) { mostrarFormError("La unidad es obligatoria."); return null; }
    if (isNaN(stock) || stock < 0) { mostrarFormError("El stock debe ser un número válido."); return null; }

    errorEl.classList.add("d-none");

    const body = { title, description, category, pricePerUnit: precio, price: precio, unit, stock };
    if (image) body.image = image;
    return body;
}

function mostrarFormError(msg) {
    const el = document.getElementById("formError");
    el.textContent = msg;
    el.classList.remove("d-none");
}

async function guardarProducto() {
    const body = leerFormulario();
    if (!body) return;

    const id = document.getElementById("productoId").value;
    const esEdicion = !!id;

    const url = esEdicion ? `${API_URL}/products/${id}` : `${API_URL}/products`;
    const method = esEdicion ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: obtenerHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (!res.ok) {
            mostrarFormError(data.message || "Error al guardar.");
            return;
        }

        $("#modalProducto").modal("hide");
        mostrarAlerta(data.message || "Producto guardado correctamente.");
        await cargarProductos();
    } catch (err) {
        mostrarFormError(`Error de red: ${err.message}`);
    }
}

// --- Modal eliminar ---

let idAEliminar = null;

function abrirModalEliminar(id) {
    const producto = productosCache.find(p => p.id === id);
    if (!producto) return;
    idAEliminar = id;
    document.getElementById("eliminarNombre").textContent = producto.title;
    $("#modalEliminar").modal("show");
}

async function eliminarProducto() {
    if (!idAEliminar) return;
    try {
        const res = await fetch(`${API_URL}/products/${idAEliminar}`, {
            method: "DELETE",
            headers: obtenerHeaders()
        });
        const data = await res.json();

        if (!res.ok) {
            mostrarAlerta(data.message || "Error al eliminar.", "danger");
            return;
        }

        $("#modalEliminar").modal("hide");
        idAEliminar = null;
        mostrarAlerta(data.message || "Producto eliminado.");
        await cargarProductos();
    } catch (err) {
        mostrarAlerta(`Error de red: ${err.message}`, "danger");
    }
}

// --- Eventos ---

document.getElementById("btnNuevoProducto").addEventListener("click", abrirModalCrear);
document.getElementById("btnGuardarProducto").addEventListener("click", guardarProducto);
document.getElementById("btnConfirmarEliminar").addEventListener("click", eliminarProducto);

// --- Init ---
actualizarNavbar();
cargarProductos();

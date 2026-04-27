import shortid from "shortid";
import productRepository from "../repositories/product.repository.js";

class ProductService {
    getAll = async ({ filters = {}, min, max }) => {
        let products = await productRepository.getAllProducts();

        // filtra por cualquier propiedad de texto (subcadena, no exacto)
        for (const [key, value] of Object.entries(filters)) {
            products = products.filter((p) =>
                String(p[key] ?? "").toLowerCase().includes(String(value).toLowerCase())
            );
        }

        // filtra por rango de precio, solo si se mandaron los params
        if (min !== undefined) products = products.filter((p) => p.price >= Number(min));
        if (max !== undefined) products = products.filter((p) => p.price <= Number(max));

        return products;
    };

    getById = async (id) => {
        const product = await productRepository.getProductById(id);
        if (!product) throw { status: 404, message: "Producto no encontrado" };
        return product;
    };

    postCart = async (username, ids) => {
        if (!Array.isArray(ids)) throw { status: 400, message: "ids debe ser un arreglo" };

        const productos = [];
        for (const id of ids) {
            const product = await productRepository.getProductById(id);
            if (!product) throw { status: 404, message: `Producto con id ${id} no encontrado` };
            const { stock, ...productWithoutStock } = product;
            productos.push(productWithoutStock);
        }

        // si ya tenía carrito lo reemplaza, si no lo crea
        await productRepository.saveCart(username, ids);
        return productos;
    };

    getCartByUser = async (username) => {
        const carts = await productRepository.getAllCarts();
        const userCart = carts.find((c) => c.user === username);
        if (!userCart) throw { status: 404, message: "Carrito no encontrado para el usuario" };

        const productos = [];
        let total = 0;

        for (const id of userCart.cart) {
            const product = await productRepository.getProductById(id);
            if (product) productos.push(product);
        }

        for (const p of productos) {
            total += p.price;
        }

        return { user: username, products: productos, total };
    }

    createProduct = async (product) => {
        // validar campos requeridos
        if (!product.title) throw { status: 400, message: "El producto debe tener un título" };
        if (!product.description) throw { status: 400, message: "El producto debe tener una descripción" };
        if (!product.unit) throw { status: 400, message: "El producto debe tener una unidad de medida" };
        if (!product.category) throw { status: 400, message: "El producto debe tener una categoría" };
        if (product.pricePerUnit === undefined) throw { status: 400, message: "El producto debe tener un precio por unidad" };
        if (product.stock === undefined) throw { status: 400, message: "El producto debe tener un stock" };

        // el id lo genera el server, no el cliente
        const idProduct = shortid.generate();
        const newProduct = { id: idProduct, ...product };
        await productRepository.createProduct(newProduct);
        return newProduct;
    }

    updateProduct = async (id, product) => {
        const existingProduct = await productRepository.getProductById(id);
        if (!existingProduct) throw { status: 404, message: "Producto no encontrado" };

        // validar que vengan todos los campos (es PUT, no PATCH)
        if (!product.title) throw { status: 400, message: "El producto debe tener un título" };
        if (!product.description) throw { status: 400, message: "El producto debe tener una descripción" };
        if (!product.unit) throw { status: 400, message: "El producto debe tener una unidad de medida" };
        if (!product.category) throw { status: 400, message: "El producto debe tener una categoría" };
        if (product.pricePerUnit === undefined) throw { status: 400, message: "El producto debe tener un precio por unidad" };
        if (product.stock === undefined) throw { status: 400, message: "El producto debe tener un stock" };

        const updatedProduct = await productRepository.updateProduct(id, product);
        return updatedProduct;
    }

    deleteProduct = async (id) => {
        const product = await productRepository.getProductById(id);
        if (!product) throw { status: 404, message: "Producto no encontrado" };
        await productRepository.deleteProduct(id);
        return product.title;
    }
}

export default new ProductService();

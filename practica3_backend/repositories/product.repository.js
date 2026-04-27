import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// __dirname no existe en ES Modules, hay que reconstruirlo
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../products.json");
const CARTS_PATH = join(__dirname, "../cart.json");

const getAllProducts = async () => {
    const data = await readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
};

const getProductById = async (id) => {
    const products = await getAllProducts();
    return products.find((p) => p.id === id) || null;
}

const getAllCarts = async () => {
    const data = await readFile(CARTS_PATH, "utf-8");
    return JSON.parse(data);
}

const saveCart = async (username, ids) => {
    const carts = await getAllCarts();
    const existingCartIndex = carts.findIndex((c) => c.user === username);

    if (existingCartIndex === -1) {
        carts.push({ user: username, cart: ids }); // nuevo carrito
    } else {
        carts[existingCartIndex].cart = ids; // reemplaza el existente
    }

    await writeFile(CARTS_PATH, JSON.stringify(carts, null, 2));
}

const createProduct = async (product) => {
    const products = await getAllProducts();
    products.push(product);
    await writeFile(DB_PATH, JSON.stringify(products, null, 2));
}

const updateProduct = async (id, product) => {
    const products = await getAllProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // spread para no perder el id original aunque no venga en el body
    products[index] = { ...products[index], ...product };
    await writeFile(DB_PATH, JSON.stringify(products, null, 2));
    return products[index];
}

const deleteProduct = async (id) => {
    const products = await getAllProducts();
    const filtered = products.filter((p) => p.id !== id);
    await writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
}

export default {
    getAllProducts,
    getProductById,
    getAllCarts,
    saveCart,
    createProduct,
    updateProduct,
    deleteProduct
};

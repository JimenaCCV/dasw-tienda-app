import productService from "../services/product.service.js";

export const getProducts = async (req, res) => {
    try {
        // si manda x-auth: admin puede ver el stock
        const isAdmin = req.header("x-auth") === "admin";

        const { min, max, ...filters } = req.query; // separo precio del resto de filtros
        const products = await productService.getAll({ filters, min, max });

        const result = products.map((product) => {
            const { stock, ...rest } = product;
            return isAdmin ? product : rest;
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getById(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
};

export const postCart = async (req, res) => {
    try {
        const username = req.userName; // viene del middleware validateUser
        const ids = req.body;
        const productos = await productService.postCart(username, ids);
        res.status(200).json(productos);
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
}

export const getProductsByUser = async (req, res) => {
    try {
        const username = req.userName; // viene del middleware validateUser
        const cart = await productService.getCartByUser(username);
        res.status(200).json(cart);
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const product = req.body;
        const newProduct = await productService.createProduct(product);
        res.status(201).json({ id: newProduct.id, message: `Producto "${newProduct.title}" creado exitosamente` });
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const title = await productService.deleteProduct(id);
        res.status(200).json({ message: `Producto "${title}" eliminado exitosamente` });
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = req.body;
        const updatedProduct = await productService.updateProduct(id, product);
        res.status(200).json({ message: `Producto "${updatedProduct.title}" actualizado exitosamente` });
    } catch (error) {
        res.status(error.status ?? 500).json({ message: error.message });
    }
}

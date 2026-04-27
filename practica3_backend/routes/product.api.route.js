import { Router } from "express";
import validarUsuario from "../middlewares/validateUser.middleware.js";
import validarAdmin from "../middlewares/validateAdmin.middleware.js";
import { getProducts, getProductById, postCart, getProductsByUser, createProduct, updateProduct, deleteProduct } from "../controller/product.controller.js";

export const router = Router();

router.get("/products", validarUsuario, getProducts); // lista todos, el stock solo lo ve admin

// carrito del usuario 
router.post("/products/cart", validarUsuario, postCart);
router.get("/products/cart", validarUsuario, getProductsByUser);

router.get("/products/:id", getProductById); // no requiere auth

// solo admin puede crear, editar o borrar productos
router.post("/products", validarAdmin, createProduct);
router.put("/products/:id", validarAdmin, updateProduct);
router.delete("/products/:id", validarAdmin, deleteProduct);

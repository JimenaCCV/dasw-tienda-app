import { request, response } from "express";

const validarAdmin = (req = request, res = response, next) => {
    const header = req.header("x-auth") || null;
    if (!header || header !== "admin") {
        return res.status(403).json({ message: "Acceso no autorizado, no se cuenta con privilegios de administrador" });
    }
    req.isAdmin = true;
    next();
}

export default validarAdmin;
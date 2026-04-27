import { request, response } from "express";   

const validarUsuario = (req = request, res = response, next) => {
    const header = req.header("x-user") || null;
    
    if (!header) {
        return res.status(403).json({ message: "No se proporcionó el header 'x-user'." });
    }
    req.userName = header;
    next();
}

export default validarUsuario;
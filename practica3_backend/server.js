import express from "express";
import { router } from "./routes/product.api.route.js";
import cors from "cors";   

/**
 * 2. INSTANCIACIÓN Y MIDDLEWARES (Configuración)
 */
const app = express();

/**
 * MIDDLEWARE PARA JSON: 
 * Permite que Express entienda el cuerpo (body) de las peticiones que vienen como JSON.
 * Sin esto, req.body sería 'undefined'.
 */
app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend
app.use(express.static('public'));


app.use(express.json());
app.use('/api', router);

app.get("/", (req, res) => {
    res.status(200).json({ message: "e-commerce app práctica 3" });
});

const PUERTO = 3100;
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PUERTO}.`);
});
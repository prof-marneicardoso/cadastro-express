import express from "express";
import userRoutes from "./routes/userRoutes.js";
import logger from "./middleware/logger.js";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);
app.use(cors()); // Habilita CORS para todos os domínios

// Rotas
app.use("/api/users", userRoutes);

// Servidor
const host = "localhost";
const port = "3300";

app.listen(port, () => {
    // console.log(`Servidor rodando em: http://localhost:3300`);
    console.log(`Servidor rodando em: http://${host}:${port}`);   // LOG
});

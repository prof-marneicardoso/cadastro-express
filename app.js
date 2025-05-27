import express from "express";
import userRoutes from "./routes/userRoutes.js";
import logger from "./middleware/logger.js"

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// Rotas
app.use("/api/users", userRoutes);

// Servidor
const host = "localhost";
const port = "3300";

app.listen(port, () => {
    // console.log(`Servidor rodando em: http://localhost:3300`);
    console.log(`Servidor rodando em: http://${host}:${port}`);   // LOG
});

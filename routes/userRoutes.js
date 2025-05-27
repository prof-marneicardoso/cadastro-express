import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, "../data/users.json");

// Cria o arquivo users.json se necessário
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]");
}

router.post("/", async (request, response) => {
    // Desestruturação dos dados enviados na requisição
    const { nome, email, senha } = request.body;

    // Verifica os campos em branco
    if (!nome || !email || !senha) {
        return response.status(400).json({
            erro: "Nome, E-mail e Senha são obrigatórios"
        });
    }

    try {
        // Busca os usuários existentes
        const data = fs.readFileSync(usersFile, "utf-8");
        const users = JSON.parse(data);

        // Verifica se o E-mail já existe
        const emailExists = users.find((user) => user.email === email);

        if (emailExists) {
            return response.status(409).json({
                erro: "E-mail já cadastrado"
            });
        }

        // Gera o Hash da Senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria um novo usuário
        const newUser = {
            id: uuidv4,
            name: nome,
            email: email,
            password: hashedPassword,
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date().toLocaleDateString()
        };

        // Adiciona o novo usuário no array (lista de usuários)
        users.push(newUser);

        // Salva no arquivo
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        // Remove a senha do retorno (não mostra a senha na tela)
        const { senha: _, ...userWithoutPassword } = newUser;

        response.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: userWithoutPassword
        });

    } catch(erro) {
        console.error("Erro ao criar usuário:", erro);
        response.status(500).json({
            erro: "Erro ao criar usuário."
        });
    }
});

export default router;

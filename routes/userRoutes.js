import express from "express";
import fs, { stat } from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const usersFile = path.join(__dirname, "../data/users.json");

// Garante que a pasta e o arquivo existem
function ensureUserFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, "[]");
    }
}

router.post("/", async (request, response) => {
    // Desestruturação dos dados enviados na requisição
    const { nome, email, senha } = request.body;
    
    ensureUserFile();

    // Verifica os campos em branco
    if (!nome || !email || !senha) {
        return response.status(400).json({
            // erro: "Nome, E-mail e Senha são obrigatórios",
            status: 400
        });
    }

    try {
        // Busca os usuários existentes
        const data = fs.readFileSync(usersFile, "utf-8");
        const users = JSON.parse(data || "[]");

        // Verifica se o E-mail já existe
        const emailExists = users.find((user) => user.email === email);

        if (emailExists) {
            return response.status(409).json({
                // erro: "E-mail já cadastrado",
                status: 409
            });
        }

        // Gera o Hash da Senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria o ID único
        const id = uuidv4();

        // Cria um novo usuário
        const newUser = {
            uid: id,
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
            // mensagem: "Usuário cadastrado com sucesso!",
            // usuario: userWithoutPassword
            status: 201
        });

    } catch(erro) {
        // console.error("Erro ao criar usuário:", erro);
        response.status(500).json({
            // erro: "Erro ao criar usuário."
            status: 500
        });
    }
});

export default router;

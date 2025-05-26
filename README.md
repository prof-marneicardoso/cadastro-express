# Cadastro com Express

Projeto de Cadastro de Usuários utilizando o framework Express com Node.js

---
### Arquitetura de Diretórios:

```
cadastro-express/
│
├── app.js
│
├── middleware/
│   └── logger.js
│
├── routes/
│   └── userRoutes.js
│
├── data/
│   └── users.json
│
└── logs/
    └── requests.json
```

### app.js
```js
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import logger from './middleware/logger.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// Rotas
app.use('/api/users', userRoutes);

// Servidor
const host = "localhost";
const port = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://${host}$:${port}`);
});
```

### middleware/logger.js

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolver __dirname com ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');
const logFile = path.join(logsDir, 'requests.json');

// Garante que pasta e arquivo existem
function ensureLogFile() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '[]');
  }
}

function logger(request, response, next) {
  ensureLogFile();

  const logData = {
    data: new Date().toLocaleDateString(),
    metodo: request.method,
    url: request.url,
    body: request.body
  };

  console.log(`[${logData.data}] ${logData.metodo} ${logData.url}`);

  fs.readFile(logFile, 'utf8', (erro, data) => {
    let logs = [];
    try {
      logs = JSON.parse(data || '[]');
    } catch {
      logs = [];
    }

    logs.push(logData);

    fs.writeFile(logFile, JSON.stringify(logs, null, 2), (erro) => {
      if (erro) console.error('Erro ao salvar log:', erro);
    });
  });

  next();
}

export default logger;
```

### routes/userRoutes.js

```js
import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, '../data/users.json');

// Cria o arquivo users.json se necessário
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, '[]');
}

router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(data || '[]');

    const existe = users.find((u) => u.email === email);
    if (existe) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: uuidv4(),
      nome,
      email,
      senha: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(novoUsuario);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: usuarioSemSenha
    });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ erro: 'Erro ao salvar usuário.' });
  }
});

export default router;
```


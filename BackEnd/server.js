import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

// Rota para criar um novo usuário (POST)
app.post("/usuarios", async (req, res) => {
  try {
    const { email, name, age } = req.body;

    // Validação dos campos obrigatórios
    if (!email || !name || age == null) {
      return res
        .status(400)
        .json({ error: "Campos 'email', 'name' e 'age' são obrigatórios." });
    }

    // Conversão de `age` para inteiro
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        age: parseInt(age),
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao criar usuário", details: error.message });
  }
});

// Rota para listar todos os usuários (GET)
app.get("/usuarios", async (req, res) => {
  try {
    const { name, email, age } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(name && { name: { contains: name } }), // Busca aproximada
        ...(email && { email: { contains: email } }), // Busca aproximada
        ...(age && { age: parseInt(age) }), // Conversão de age para inteiro
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar usuários", details: error.message });
  }
});

// Rota para editar um usuário (PUT)
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { email, name, age } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ error: "O campo 'id' é obrigatório." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        name,
        age: parseInt(age),
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(500).json({ error: "Erro ao editar usuário", details: error.message });
  }
});

// Rota para deletar um usuário (DELETE)
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: id.toString() }, // Converte o id para string
    });

    return res.status(200).json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(500).json({ error: "Erro ao excluir usuário", details: error.message });
  }
});



// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor está funcionando!");
});

// Configuração da porta
const port = 4001;
app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});

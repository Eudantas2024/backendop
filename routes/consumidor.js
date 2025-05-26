const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Consumidor = require("../models/Consumidor");
const enviarEmail = require("../utils/enviarEmail"); // ✅ Importação adicionada

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// Rota para registro do consumidor
router.post("/register", async (req, res) => {
  const { username, email, senha } = req.body;

  if (!username || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const existente = await Consumidor.findOne({ email });
    if (existente) return res.status(400).json({ error: "E-mail já cadastrado." });

    const hashedSenha = await bcrypt.hash(senha, 10);
    const novoConsumidor = new Consumidor({ username, email, senha: hashedSenha });
    await novoConsumidor.save();

    // ✅ Envia e-mail de boas-vindas
    try {
    await enviarEmail(
      email,
      "Bem-vindo ao Opina +",
      `
        <h2>Olá ${username},</h2>
        <p>Seu cadastro foi realizado com sucesso no <strong>Opina +</strong>!</p>
        <p>Agora você pode fazer login e enviar suas reclamações com facilidade.</p>
        <p>Obrigado por confiar em nossa plataforma.</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">Este é um e-mail automático. Por favor, não responda.</p>
      `
    );
     console.log("Email de boas-vindas enviado com sucesso.");
     } catch (err) {
     console.error("Erro ao enviar email de boas-vindas:", err.message);
     }
    res.status(201).json({ message: "Cadastro realizado com sucesso! Verifique seu e-mail." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Usuário ou e-mail já cadastrado." });
    }
    console.error("Erro no cadastro consumidor:", error);
    res.status(500).json({ error: "Erro ao cadastrar consumidor." });
  }
});

// Rota para login do consumidor
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const consumidor = await Consumidor.findOne({ email });
    if (consumidor && await bcrypt.compare(senha, consumidor.senha)) {
      const token = jwt.sign({ id: consumidor._id, email: consumidor.email }, jwtSecret, { expiresIn: "1h" });
      res.json({ message: "Login bem-sucedido!", token });
    } else {
      res.status(401).json({ error: "Email ou senha incorretos." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no login.", detalhe: error.message });
  }
});

module.exports = router;

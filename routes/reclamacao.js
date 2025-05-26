const express = require("express");
const Reclamacao = require("../models/Reclamacao");
const Consumidor = require("../models/Consumidor");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const autenticarAdmin = require("../middlewares/autenticarAdmin");
const autenticarToken = require("../middlewares/autenticarToken");
const multer = require("multer");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET;

// Config multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Config nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(destinatario, assunto, texto) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: assunto,
    text: texto,
  };
  await transporter.sendMail(mailOptions);
}

// Criar reclamação sem anexos
router.post("/", autenticarToken, async (req, res) => {
  try {
    const { mensagem, tipoFeedback, titulo } = req.body;

    if (!mensagem || mensagem.trim().length < 10)
      return res
        .status(400)
        .json({ error: "Mensagem inválida ou muito curta." });

    const tiposValidos = ["sugestao", "problema", "elogio", "duvida", "outros"];
    if (!tipoFeedback || !tiposValidos.includes(tipoFeedback))
      return res.status(400).json({ error: "Tipo de feedback inválido." });

    const consumidor = await Consumidor.findById(req.userId);
    if (!consumidor) return res.status(404).json({ error: "Usuário não encontrado." });

    const novaReclamacao = new Reclamacao({
      userId: consumidor._id,
      username: consumidor.username,
      email: consumidor.email,
      mensagem,
      tipoFeedback,
      titulo,
      publicada: false,
      dataEnvio: new Date(),
    });

    await novaReclamacao.save();
    res.status(201).json({ message: "Reclamação enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar reclamação:", error);
    res.status(500).json({ error: "Erro ao enviar reclamação." });
  }
});

// Criar reclamação com anexos (máx 5 arquivos)
router.post(
  "/upload",
  autenticarToken,
  upload.array("anexos", 5),
  async (req, res) => {
    try {
      const { mensagem, titulo, tipoFeedback } = req.body;

      if (!mensagem || mensagem.trim().length < 10)
        return res
          .status(400)
          .json({ error: "A mensagem deve ter no mínimo 10 caracteres." });

      const tiposValidos = ["sugestao", "problema", "elogio", "duvida", "outros"];
      if (!tipoFeedback || !tiposValidos.includes(tipoFeedback))
        return res.status(400).json({ error: "Tipo de feedback inválido." });

      const consumidor = await Consumidor.findById(req.userId);
      if (!consumidor) return res.status(404).json({ error: "Usuário não encontrado." });

      const anexos = req.files ? req.files.map((file) => file.filename) : [];

      const novaReclamacao = new Reclamacao({
        userId: consumidor._id,
        username: consumidor.username,
        email: consumidor.email,
        mensagem,
        titulo,
        tipoFeedback,
        anexos,
        publicada: false,
        dataEnvio: new Date(),
      });

      await novaReclamacao.save();
      res.status(201).json({ message: "Reclamação enviada com sucesso." });
    } catch (error) {
      console.error("Erro ao enviar reclamação com anexos:", error);
      res.status(500).json({ error: "Erro ao enviar reclamação." });
    }
  }
);

// Listar reclamações do usuário logado
router.get("/minhas", autenticarToken, async (req, res) => {
  try {
    const reclamacoes = await Reclamacao.find({ userId: req.userId })
      .select(
        "titulo mensagem tipoFeedback anexos email username createdAt dataEnvio publicada"
      )
      .sort({ createdAt: -1 });

    res.json(reclamacoes);
  } catch (error) {
    console.error("Erro ao buscar reclamações:", error);
    res.status(500).json({ error: "Erro ao buscar reclamações." });
  }
});

// Listar reclamações pendentes (admin)
router.get("/pendentes", autenticarAdmin, async (req, res) => {
  try {
    const pendentes = await Reclamacao.find({ publicada: false }).sort({
      createdAt: -1,
    });
    res.json(pendentes);
  } catch (error) {
    console.error("Erro ao buscar reclamações pendentes:", error);
    res.status(500).json({ error: "Erro ao buscar reclamações pendentes." });
  }
});

// Aprovar reclamação e enviar email
router.put("/aprovar/:id", autenticarAdmin, async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);
    if (!reclamacao)
      return res.status(404).json({ error: "Reclamação não encontrada." });

    reclamacao.publicada = true;
    await reclamacao.save();

    const assunto = "Sua reclamação foi aprovada";
    const texto = `Olá ${reclamacao.username},

Sua reclamação enviada em ${new Date(
      reclamacao.dataEnvio
    ).toLocaleString("pt-BR")} foi aprovada pela nossa equipe e estará visível no site.

Obrigado por contribuir com seu feedback.

Atenciosamente,
Equipe Opina +`;

    await enviarEmail(reclamacao.email, assunto, texto);

    res.json({ message: "Reclamação aprovada e email enviado." });
  } catch (error) {
    console.error("Erro ao aprovar reclamação:", error);
    res.status(500).json({ error: "Erro interno ao aprovar reclamação." });
  }
});

// Listar reclamações aprovadas (públicas)
router.get("/aprovadas", async (req, res) => {
  try {
    const reclamacoesAprovadas = await Reclamacao.find({ publicada: true }).sort({
      createdAt: -1,
    });
    res.json(reclamacoesAprovadas);
  } catch (error) {
    console.error("Erro ao listar reclamações aprovadas:", error);
    res.status(500).json({ error: "Erro ao listar reclamações aprovadas." });
  }
});

// Excluir reclamação (admin)
router.delete("/:id", autenticarAdmin, async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findByIdAndDelete(req.params.id);

    if (!reclamacao) {
      return res.status(404).json({ error: "Reclamação não encontrada." });
    }

    res.json({ message: "Reclamação excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir reclamação:", error);
    res.status(500).json({ error: "Erro ao excluir reclamação." });
  }
});

module.exports = router;

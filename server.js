require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const consumidorRoutes = require("./routes/consumidor");
const adminRoutes = require("./routes/admin");
const reclamacaoRoutes = require("./routes/reclamacao");
const autenticarAdmin = require("./middlewares/autenticarAdmin");
const autenticarToken = require("./middlewares/autenticarToken");
const Consumidor = require("./models/Consumidor");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // arquivos estáticos (uploads)

// Conexão com MongoDB
async function startDatabase() {
  const { DB_USER, DB_PASS, DB_NAME } = process.env;
  const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@estudo.gr0mbz4.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado ao MongoDB Atlas");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
}
startDatabase();

// Rotas públicas e protegidas
app.use("/consumidor", consumidorRoutes);
app.use("/admin", adminRoutes);
app.use("/api/reclamacoes", reclamacaoRoutes);

// Rota protegida: perfil do consumidor
app.get("/consumidor/perfil", autenticarToken, async (req, res) => {
  try {
    const consumidor = await Consumidor.findById(req.userId).select("-senha");
    if (!consumidor)
      return res.status(404).json({ error: "Consumidor não encontrado" });

    res.json({
      username: consumidor.username,
      email: consumidor.email,
    });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota protegida por admin: listar reclamações pendentes
app.get("/api/reclamacoes/pendentes", autenticarAdmin, async (req, res) => {
  const Reclamacao = require("./models/Reclamacao"); // evitar circularidade
  try {
    const pendentes = await Reclamacao.find({ publicada: false }).sort({
      createdAt: -1,
    });
    res.json(pendentes);
  } catch (error) {
    console.error("Erro ao buscar reclamações pendentes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota teste protegida para consumidor
app.get("/conteudo", autenticarToken, (req, res) => {
  res.json({ message: "Bem-vindo à área restrita!", userId: req.userId });
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

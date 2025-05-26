const mongoose = require("mongoose");

const reclamacaoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consumidor",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: false,
  },
  tipoFeedback: {
    type: String,
    enum: ["sugestao", "problema", "elogio", "duvida", "outros"],
    required: true,
  },
  mensagem: {
    type: String,
    required: true,
  },
  anexos: {
    type: [String],
    default: [],
  },
  publicada: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // ✅ Ativa createdAt e updatedAt
});

module.exports = mongoose.model("Reclamacao", reclamacaoSchema);

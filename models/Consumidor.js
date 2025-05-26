const mongoose = require("mongoose");

const consumidorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  resetToken: String,
  resetTokenExpira: Date,
});

module.exports = mongoose.model("Consumidor", consumidorSchema);

// utils/enviarEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // ou outro provedor
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(destinatario, assunto, html) {
  const mailOptions = {
    from: `"Opina +" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: assunto,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${destinatario}`);
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
  }
}

module.exports = enviarEmail;

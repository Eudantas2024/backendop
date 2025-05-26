// routes/admin.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const jwtSecret = process.env.JWT_SECRET;

// Login do admin
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    console.log("Email enviado:", email);
    console.log("Email esperado:", process.env.ADMIN_EMAIL);

    if (email !== process.env.ADMIN_EMAIL) {
        console.log("❌ Email não confere");
        return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const senhaCorreta = await bcrypt.compare(senha, process.env.ADMIN_PASSWORD_HASH);
    console.log("✅ Senha correta?", senhaCorreta);

    if (!senhaCorreta) {
        return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ message: "Login bem-sucedido!", token });
});


module.exports = router;

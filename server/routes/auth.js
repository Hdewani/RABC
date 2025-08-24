// server/routes/auth.js
const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const { hashPassword, comparePassword } = require("../utils/hash");
const generateToken = require("../utils/generateToken");

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });

        const hashed = await hashPassword(password);

        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin",
            [name, email, hashed]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.cookie("token", token, { httpOnly: true }).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Signup failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        const user = result.rows[0];
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await comparePassword(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true }).json({
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Logged out" });
});

module.exports = router;

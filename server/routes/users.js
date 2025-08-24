const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authenticate = require("../middleware/auth");
const SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Signup (hash password before saving)
// Signup
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;  // 👈 must include email
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
            [username, email, hashedPassword]
        );

        res.json({ message: "User registered successfully", user: result.rows[0] });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
    }
});


// ✅ Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // 👇 include both id and role in the token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            SECRET || "secret",
            { expiresIn: "1h" }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Logout (stateless)
router.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Logged out" });
});


/**
 * PUT /users/make-admin
 * Admin can promote another user to admin using their email
 */
// routes/users.js
router.put("/make-admin", authenticate, async (req, res) => {
    try {
        // now req.user should exist
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Only admins can promote users" });
        }

        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const result = await pool.query(
            "UPDATE users SET role='admin' WHERE email=$1 RETURNING id, username, email, role",
            [email]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User promoted to admin", user: result.rows[0] });
    } catch (err) {
        console.error("Error promoting user:", err);
        res.status(500).json({ error: "Server error" });
    }
});




module.exports = router; 

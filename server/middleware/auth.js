// middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; // { id, username, role }
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = authenticate;

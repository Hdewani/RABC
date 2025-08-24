const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecret";

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token" });

    try {
        const user = jwt.verify(token, SECRET);
        req.user = user; // { id, role }
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token invalid or expired" });
    }
}

module.exports = authMiddleware;

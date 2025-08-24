// server/utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, is_admin: user.is_admin },
        "your_jwt_secret", // 🔴 replace with env var later
        { expiresIn: "1d" }
    );
};

module.exports = generateToken;

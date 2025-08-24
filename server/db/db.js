// server/db/db.js
const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "rabc",
    password: "merapwd",
    port: 5432,
});

pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL");
});

module.exports = pool;

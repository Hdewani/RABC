// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = express.Router();


const app = express();
const PORT = process.env.PORT || 5000;

// Disable ETag caching
app.disable('etag');

// Disable client/proxy caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});


// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/users");
const issueRoutes = require("./routes/issues");
const commentRoutes = require("./routes/comments")


app.use("/users", userRoutes);   // signup, login
app.use("/issues", issueRoutes); // protected with JWT
app.use("/comments", commentRoutes)
// app.use("/issues/:issue_id/comments", require("./routes/comments"));


// Root
app.get("/", (req, res) => {
    res.send("RBAC Issue Tracker API running ✅");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

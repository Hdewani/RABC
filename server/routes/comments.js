// routes/comments.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const pool = require("../db");
const authenticate = require("../middleware/auth");

// 🔒 All comment routes require login
router.use(authenticate);

/**
 * GET /issues/:issue_id/comments
 * Fetch all comments for an issue (with usernames)
 */
router.get("/", async (req, res) => {
    try {
        const { issue_id } = req.params;

        const result = await pool.query(
            `SELECT c.id, c.issue_id, c.user_id, c.content AS comment, c.created_at, u.username
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.issue_id = $1
             ORDER BY c.created_at ASC`,
            [issue_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /issues/:issue_id/comments
 * Add a comment to an issue
 */
router.post("/", async (req, res) => {
    try {
        const { issue_id } = req.params;
        const { comment } = req.body;

        // Check if issue exists
        const issueCheck = await pool.query("SELECT id FROM issues WHERE id = $1", [issue_id]);
        if (issueCheck.rows.length === 0) {
            return res.status(404).json({ error: "Issue not found" });
        }

        // Insert comment
        const insertResult = await pool.query(
            "INSERT INTO comments (issue_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
            [issue_id, req.user.id, comment]
        );

        const newComment = insertResult.rows[0];

        // Fetch username
        const userResult = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [newComment.user_id]
        );

        res.status(201).json({
            id: newComment.id,
            issue_id: newComment.issue_id,
            user_id: newComment.user_id,
            comment: newComment.content,
            created_at: newComment.created_at,
            username: userResult.rows[0].username
        });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * PUT /issues/:issue_id/comments/:id
 * User can edit own comment, Admin can edit any
 */
router.put("/:id", async (req, res) => {
    try {
        const { issue_id, id } = req.params;
        const { comment } = req.body;

        let query = `UPDATE comments 
                     SET content = COALESCE($1, content) 
                     WHERE id = $2 AND issue_id = $3`;
        const params = [comment, id, issue_id];

        if (req.user.role !== "admin") {
            params.push(req.user.id);
            query += ` AND user_id = $${params.length}`;
        }

        query += " RETURNING *";

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Not allowed or comment not found" });
        }

        res.json({
            id: result.rows[0].id,
            issue_id: result.rows[0].issue_id,
            user_id: result.rows[0].user_id,
            comment: result.rows[0].content,
            created_at: result.rows[0].created_at
        });
    } catch (err) {
        console.error("Error updating comment:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * DELETE /issues/:issue_id/comments/:id
 * User can delete own comment, Admin can delete any
 */
router.delete("/:id", async (req, res) => {
    try {
        const { issue_id, id } = req.params;

        let query = `DELETE FROM comments 
                     WHERE id = $1 AND issue_id = $2`;
        const params = [id, issue_id];

        if (req.user.role !== "admin") {
            params.push(req.user.id);
            query += ` AND user_id = $${params.length}`;
        }

        query += " RETURNING *";

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Not allowed or comment not found" });
        }

        res.json({
            message: "Comment deleted",
            comment: {
                id: result.rows[0].id,
                issue_id: result.rows[0].issue_id,
                user_id: result.rows[0].user_id,
                comment: result.rows[0].content,
                created_at: result.rows[0].created_at
            }
        });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

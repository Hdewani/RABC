// routes/issues.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const checkIssueOwnership = require("../middleware/checkIssueOwnership");
const commentsRouter = require("./comments");
router.use("/:issue_id/comments", commentsRouter);
router.use(authenticate);

/**
 * GET /issues/all
 * Admin-only: fetch all issues
 */
router.get("/all", requireRole("admin"), async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM issues ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching all issues:", err);
        res.status(500).json({ error: "Server error" });
    }
});




/**
 * GET /issues
 * User: fetch own issues (optional status filter + pagination)
 */
router.get("/", async (req, res) => {
    res.set("Cache-Control", "no-store");

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const offset = (page - 1) * pageSize;
    const { status } = req.query;

    try {
        let query, values;

        if (req.user.role === "admin") {
            // Admin sees all issues
            if (status) {
                query = `
                    SELECT * FROM issues 
                    WHERE status = $1
                    ORDER BY created_at DESC 
                    LIMIT $2 OFFSET $3
                `;
                values = [status, pageSize, offset];
            } else {
                query = `
                    SELECT * FROM issues 
                    ORDER BY created_at DESC 
                    LIMIT $1 OFFSET $2
                `;
                values = [pageSize, offset];
            }
        } else {
            // Normal user only sees their own issues
            if (status) {
                query = `
                    SELECT * FROM issues 
                    WHERE user_id = $1 AND status = $2
                    ORDER BY created_at DESC 
                    LIMIT $3 OFFSET $4
                `;
                values = [req.user.id, status, pageSize, offset];
            } else {
                query = `
                    SELECT * FROM issues 
                    WHERE user_id = $1
                    ORDER BY created_at DESC 
                    LIMIT $2 OFFSET $3
                `;
                values = [req.user.id, pageSize, offset];
            }
        }

        const issues = await pool.query(query, values);
        res.json(issues.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch issues" });
    }
});

/**
 * POST /issues
 * User: create a new issue
 */
router.post("/", async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            "INSERT INTO issues (title, description, status, user_id) VALUES ($1, $2, 'open', $3) RETURNING *",
            [title, description, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating issue:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get issue by ID
router.get("/:id", checkIssueOwnership, async (req, res) => {
    try {
        const issueId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;

        let query, values;

        if (role === "admin") {
            query = "SELECT * FROM issues WHERE id = $1";
            values = [issueId];
        } else {
            // Users can only see their own issues
            query = "SELECT * FROM issues WHERE id = $1 AND user_id = $2";
            values = [issueId, userId];
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Issue not found or not authorized" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching issue:", err);
        res.status(500).json({ error: "Error fetching issue" });
    }
});

/**
 * PUT /issues/:id
 * User: update own issue
 * Admin: update any issue
 */
router.put("/:id", checkIssueOwnership, async (req, res) => {
    try {
        const { title, description, status } = req.body;

        const result = await pool.query(
            `UPDATE issues 
             SET title = COALESCE($1, title), 
                 description = COALESCE($2, description), 
                 status = COALESCE($3, status) 
             WHERE id = $4 RETURNING *`,
            [title, description, status, req.issue.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating issue:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * DELETE /issues/:id
 * User: delete own issue
 * Admin: delete any issue
 */
router.delete("/:id", checkIssueOwnership, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM issues WHERE id = $1 RETURNING *",
            [req.issue.id]
        );

        res.json({ message: "Issue deleted successfully", issue: result.rows[0] });
    } catch (err) {
        console.error("Error deleting issue:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * DELETE /issues/all
 * Admin-only: delete all issues
 */
router.delete("/all", requireRole("admin"), async (req, res) => {
    try {
        await pool.query("DELETE FROM issues");
        res.json({ message: "All issues deleted (admin only)" });
    } catch (err) {
        console.error("Error deleting all issues:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

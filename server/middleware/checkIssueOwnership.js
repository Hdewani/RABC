// middleware/checkIssueOwnership.js
const pool = require("../db");

async function checkIssueOwnership(req, res, next) {
    try {
        const { id } = req.params;
        const issue = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);

        if (issue.rows.length === 0) {
            return res.status(404).json({ error: "Issue not found" });
        }

        const existingIssue = issue.rows[0];

        // Allow if admin OR issue owner
        if (req.user.role !== "admin" && existingIssue.user_id !== req.user.id) {
            return res.status(403).json({ error: "Not allowed to modify this issue" });
        }

        // Attach issue to request (so routes don’t re-query)
        req.issue = existingIssue;
        next();
    } catch (err) {
        console.error("Error checking issue ownership:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = checkIssueOwnership;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiFetch from "../api";
import CommentList from "../components/CommentList";

export default function IssueDetail() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);

    async function load() {
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch(`/issues/${id}`);
            setIssue(data);
            const cs = await apiFetch(`/issues/${id}/comments`);
            setComments(cs);
        } catch (err) {
            setError(err.message || "Failed to load issue");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [id]);

    async function submitComment(e) {
        e.preventDefault();
        if (!commentText.trim()) return;

        const temp = {
            id: `tmp-${Date.now()}`,
            comment: commentText,
            username: "You",
            created_at: new Date().toISOString()
        };
        setComments(prev => [...prev, temp]);
        setCommentText("");

        try {
            const saved = await apiFetch(`/issues/${id}/comments`, {
                method: "POST",
                body: JSON.stringify({ comment: temp.comment })
            });
            setComments(prev => prev.map(c => c.id === temp.id ? saved : c));
        } catch (err) {
            setComments(prev => prev.filter(c => c.id !== temp.id));
            setError(err.message || "Failed to add comment");
        }
    }

    async function closeIssue() {
        if (!issue || issue.status === "closed") return;
        setClosing(true);
        const prev = issue;
        setIssue({ ...issue, status: "closed" });

        try {
            await apiFetch(`/issues/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: "closed" })
            });
        } catch (err) {
            setIssue(prev);
            setError(err.message || "Failed to close issue");
        } finally {
            setClosing(false);
        }
    }

    if (loading) return <div className="container">Loading issue...</div>;

    if (!issue) return <div className="container error">Issue not found</div>;

    return (
        <div className="container issue-detail">
            <h2>
                {issue.title}
                <small className={`status ${issue.status}`}>{issue.status}</small>
            </h2>
            <p className="description">{issue.description}</p>


            <section className="comments">
                <h3>Comments</h3>
                <CommentList comments={comments} />
                <form onSubmit={submitComment} className="comment-form">
                    <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                    />
                    <button type="submit" className="btn">Add Comment</button>
                </form>
            </section>

            {error && <p className="error">{error}</p>}
        </div>
    );
}

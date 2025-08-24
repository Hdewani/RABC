import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiFetch from "../api";
import IssueCard from "../components/IssueCard";
import Pagination from "../components/Pagination";

export default function IssuesList() {
    const [issues, setIssues] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [error, setError] = useState("");

    async function load() {
        try {
            const q = new URLSearchParams();
            if (status) q.append("status", status);
            q.append("page", page);
            q.append("page_size", pageSize);
            if (search) q.append("search", search);

            const data = await apiFetch(`/issues?${q.toString()}`);
            setIssues(Array.isArray(data) ? data : []);
            setHasMore((data || []).length === pageSize);
        } catch (err) {
            setError(err.message || "Failed to load issues");
        }
    }

    useEffect(() => { load(); }, [page, status]);

    async function create(e) {
        e.preventDefault();
        if (!newTitle) return;
        setCreating(true);
        setError("");

        const temp = {
            id: `tmp-${Date.now()}`,
            title: newTitle,
            description: newDesc,
            status: "open",
            created_at: new Date().toISOString()
        };
        setIssues(prev => [temp, ...prev]);
        setNewTitle(""); setNewDesc("");

        try {
            const saved = await apiFetch("/issues", {
                method: "POST",
                body: JSON.stringify({ title: temp.title, description: temp.description })
            });
            setIssues(prev => prev.map(i => i.id === temp.id ? saved : i));
        } catch (err) {
            setIssues(prev => prev.filter(i => i.id !== temp.id));
            setError(err.message || "Create failed");
        } finally {
            setCreating(false);
        }
    }

    async function onCloseOptimistic(id) {
        const previous = issues;
        setIssues(prev => prev.map(i => i.id === id ? { ...i, status: "closed" } : i));
        try {
            await apiFetch(`/issues/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: "closed" })
            });
        } catch (err) {
            setIssues(previous);
            setError(err.message || "Close failed");
        }
    }

    return (
        <div className="container">
            {/* Filters + new issue button */}
            <div className="card-row" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, paddingRight: "10px" }}>
                    <input
                        className="input"
                        placeholder="Search issues..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button
                        className="btn"
                        onClick={() => { setPage(1); load(); }}
                    >
                        Apply
                    </button>
                </div>
                <Link to="/new-issue" className="btn">+ New Issue</Link>
            </div>

            {/* Quick create */}
            <div className="form-box" style={{ marginBottom: 16 }}>
                <form onSubmit={create} className="form-row">
                    <input
                        className="input"
                        placeholder="Quick title"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        required
                    />
                    <input
                        className="input"
                        placeholder="Quick description"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btn"
                        disabled={creating}
                    >
                        Create
                    </button>
                </form>
            </div>

            {error && <p className="error">{error}</p>}

            {/* Issue list */}
            <div className="list">
                {issues.map(issue => (
                    <IssueCard
                        key={issue.id}
                        issue={issue}
                        onCloseOptimistic={onCloseOptimistic}
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination page={page} onChange={setPage} hasMore={hasMore} />
        </div>
    );
}

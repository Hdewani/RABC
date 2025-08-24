import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiFetch from "../api";

export default function IssueForm() {
    const { id } = useParams();
    const edit = Boolean(id);
    const nav = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        if (edit) {
            apiFetch(`/issues/${id}`)
                .then(data => {
                    setTitle(data.title);
                    setDescription(data.description);
                })
                .catch(e => setErr(e.message));
        }
    }, [edit, id]);

    async function submit(e) {
        e.preventDefault();
        setErr("");
        try {
            if (edit) {
                await apiFetch(`/issues/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ title, description })
                });
            } else {
                await apiFetch("/issues", {
                    method: "POST",
                    body: JSON.stringify({ title, description })
                });
            }
            nav("/");
        } catch (e) {
            setErr(e.message || "Save failed");
        }
    }

    return (
        <div className="container">
            <div className="form-card">
                <h2 className="form-title">{edit ? "Edit Issue" : "Create Issue"}</h2>
                <form onSubmit={submit} className="form">
                    <label className="form-label">Title</label>
                    <input
                        className="form-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                    />

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {edit ? "Save" : "Create"}
                        </button>
                    </div>

                    {err && <p className="error-text">{err}</p>}
                </form>
            </div>
        </div>
    );
}

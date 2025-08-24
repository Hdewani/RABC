import React from "react";
import { Link } from "react-router-dom";

export default function IssueCard({ issue, onCloseOptimistic }) {
    return (
        <div className="card">
            <div className="card-row">
                <h3 className="card-title">{issue.title}</h3>
                <small className={`status ${issue.status}`}>{issue.status}</small>
            </div>

            <p className="card-desc">{issue.description}</p>

            <div className="card-row card-actions">
                <Link to={`/issues/${issue.id}`} className="link">
                    View
                </Link>
                {issue.status !== "closed" && (
                    <button
                        className="btn-small"
                        onClick={() => onCloseOptimistic(issue.id)}
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}

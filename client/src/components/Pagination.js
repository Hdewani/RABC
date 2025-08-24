import React from "react";

export default function Pagination({ page, onChange, hasMore }) {
    return (
        <div className="pagination">
            <button
                className="btn-page"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
            >
                Prev
            </button>

            <span className="page-label">Page {page}</span>

            <button
                className="btn-page"
                onClick={() => onChange(page + 1)}
                disabled={!hasMore}
            >
                Next
            </button>
        </div>
    );
}

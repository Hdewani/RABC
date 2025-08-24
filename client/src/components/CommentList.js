

export default function CommentList({ comments }) {
    if (!comments || comments.length === 0) {
        return <p className="no-comments">No comments yet.</p>;
    }

    return (
        <div className="comments-container">
            {comments.map((c) => (
                <div className="comment" key={c.id}>
                    <div className="comment-head">
                        <span className="username">
                            {c.username || c.user_id || "User"}
                        </span>
                        <span className="timestamp">
                            {new Date(c.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div className="comment-body">{c.comment}</div>
                </div>
            ))}
        </div>
    );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../auth";

export default function Header() {
    const navigate = useNavigate();
    const token = getToken();

    function logout() {
        clearToken();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">IssueTracker</Link>
                </div>
                <nav className="nav">
                    {token ? (
                        <>
                            <Link to="/">Issues</Link>
                            <Link to="/new-issue">New</Link>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

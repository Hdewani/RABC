import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../api";
import { setToken } from "../auth";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await apiFetch("/users/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            setToken(data.token);
            navigate("/"); // go to issues list
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <h2 className="form-title">Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                </form>
                <p className="form-footer">
                    Don’t have an account? <a href="/signup">Signup</a>
                </p>
            </div>
        </div>
    );
}

export default Login;

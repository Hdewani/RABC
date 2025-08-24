import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../api";
import { setToken } from "../auth";

function Signup() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await apiFetch("/users/signup", {
                method: "POST",
                body: JSON.stringify({ email, password, username }),
            });

            setToken(data.token);
            navigate("/login");
        } catch (err) {
            setError("Signup failed. Try again.");
        }
    };

    return (
        <div className="signup-container">
            <div className="card">
                <h2 className="title">Create an Account</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>UserName</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">
                        Signup
                    </button>
                </form>
                <p className="switch-text">
                    Already have an account?{" "}
                    <a href="/login" className="link">Login</a>
                </p>
            </div>
        </div>
    );
}

export default Signup;

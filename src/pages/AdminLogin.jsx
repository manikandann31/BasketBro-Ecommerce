import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { adminLogin } from "../services/authService";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await adminLogin(username, password);

            localStorage.setItem(
                "adminToken",
                response.data.token
            );

            navigate("/admin");
        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="admin-login">
            <div className="admin-login-card">
                <div className="admin-login-icon" aria-hidden="true">
                    🔐
                </div>

                <span className="admin-eyebrow">STORE MANAGEMENT</span>

                <h1>Admin Login</h1>

                <p className="admin-login-description">
                    Sign in to manage your products and inventory.
                </p>

                {error && (
                    <div
                        className="admin-alert admin-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-field">
                        <label htmlFor="admin-username">
                            Username
                        </label>

                        <input
                            id="admin-username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="admin-form-field">
                        <label htmlFor="admin-password">
                            Password
                        </label>

                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-button admin-button-primary admin-login-submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="admin-login-footer">
                    Authorized administrators only
                </p>
            </div>
        </section>
    );
}

export default AdminLogin;
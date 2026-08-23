import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1 className="auth-title">Smart Day Planner</h1>
        <p className="text-sm text-muted mb-4">Log in to see your schedule.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Log in</button>
        </form>

        <p className="text-sm text-muted" style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
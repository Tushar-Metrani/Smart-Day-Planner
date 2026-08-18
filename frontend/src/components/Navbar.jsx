import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const linkStyle = (path) => ({
    marginRight: 16,
    fontWeight: location.pathname === path ? 700 : 400,
    color: location.pathname === path ? "#2563eb" : "#333",
    textDecoration: "none",
  });

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1000, margin: "20px auto 0", padding: "0 16px" }}>
      <div>
        <Link to="/" style={linkStyle("/")}>Schedule</Link>
        <Link to="/goals" style={linkStyle("/goals")}>Goals</Link>
        <Link to="/analytics" style={linkStyle("/analytics")}>Analytics</Link>
        <Link to="/settings" style={linkStyle("/settings")}>Settings</Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>Hi, {user?.name}</span>
        <button onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
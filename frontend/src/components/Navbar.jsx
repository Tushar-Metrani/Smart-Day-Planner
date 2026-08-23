import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Schedule" },
  { to: "/goals", label: "Goals" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="top-nav-bar">
      <div className="top-nav">
        <div className="flex-row gap-6">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-md)" }}>
            Smart Day Planner
          </span>
          <div className="top-nav-links">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => `top-nav-link${isActive ? " active" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex-row gap-3">
          <span className="text-sm text-muted">Hi, {user?.name}</span>
          <button className="btn btn-sm" onClick={logout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
import { NavLink } from "react-router-dom";
import { CalendarClock, Target, BarChart3, Settings } from "lucide-react";

const TABS = [
  { to: "/", label: "Schedule", icon: CalendarClock },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
        >
          <Icon size={22} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
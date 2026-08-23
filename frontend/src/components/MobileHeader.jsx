import { useLocation } from "react-router-dom";

const TITLES = {
  "/": "Schedule",
  "/goals": "Goals",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function MobileHeader() {
  const location = useLocation();
  const title = TITLES[location.pathname] || "Smart Day Planner";

  return (
    <header className="mobile-header">
      <h1 className="mobile-header-title">{title}</h1>
    </header>
  );
}
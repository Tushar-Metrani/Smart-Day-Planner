import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Schedule from "./pages/Schedule.jsx";
import Goals from "./pages/Goals.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import NavBar from "./components/NavBar.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import BottomNav from "./components/BottomNav.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Private = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <>
      <NavBar />
      <MobileHeader />
      {children}
      <BottomNav />
    </>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Private><Schedule /></Private>} />
      <Route path="/goals" element={<Private><Goals /></Private>} />
      <Route path="/analytics" element={<Private><Analytics /></Private>} />
      <Route path="/settings" element={<Private><Settings /></Private>} />
    </Routes>
  );
}
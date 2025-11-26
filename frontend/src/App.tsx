import "./App.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <main className="app-main">
        <AppRouter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

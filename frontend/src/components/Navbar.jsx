import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
    
      <div className="desktop-buttons">
        <button className="nav-btn" onClick={() => navigate("/login")}>
          Logowanie
        </button>

        <button className="nav-btn" onClick={() => navigate("/register")}>
          Rejestracja
        </button>
      </div>
      <div
        className="hamburger-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-btn" onClick={() => navigate("/login")}>
            Logowanie
          </button>

          <button className="mobile-btn" onClick={() => navigate("/register")}>
            Rejestracja
          </button>
        </div>
      )}
    </nav>
  );
}

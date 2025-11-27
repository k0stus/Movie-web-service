import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      
      {/* Desktop buttons */}
      <div className="desktop-buttons">
        <button className="nav-btn" onClick={() => navigate("/login")}>
          Logowanie
        </button>

        <button className="nav-btn" onClick={() => navigate("/register")}>
          Rejestracja
        </button>
      </div>

      {/* Hamburger */}
      <div
        className="hamburger-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* Mobile menu */}
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

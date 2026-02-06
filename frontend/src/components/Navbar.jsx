import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">

     
      <div className="navbar-logo" onClick={() => navigate("/")}>
        Movie Web App
      </div>

      
      <div className="desktop-buttons">

        {!user && (
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>
              Logowanie
            </button>

            <button className="nav-btn" onClick={() => navigate("/register")}>
              Rejestracja
            </button>
          </>
        )}

        {user && (
          <>
            <span className="nav-email">{user.email}</span>

            <button
              className="nav-btn logout-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Wyloguj
            </button>
          </>
        )}
      </div>

      <div
        className="hamburger-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">

          {!user && (
            <>
              <button
                className="mobile-btn"
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
              >
                Logowanie
              </button>

              <button
                className="mobile-btn"
                onClick={() => {
                  navigate("/register");
                  setMenuOpen(false);
                }}
              >
                Rejestracja
              </button>
            </>
          )}

          {user && (
            <>
              <span className="mobile-email">{user.email}</span>

              <button
                className="mobile-btn logout-btn"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                Wyloguj
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}


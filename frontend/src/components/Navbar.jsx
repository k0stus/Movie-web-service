// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

// watchlisty (TMDB)
const WATCHLISTS = [
  { id: "popular", label: "Popularne" },
  { id: "action", label: "Akcja" },
  { id: "comedy", label: "Komedia" },
  { id: "animation", label: "Animacja" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  const [search, setSearch] = useState("");
  const [list, setList] = useState("popular");
  const [menuOpen, setMenuOpen] = useState(false);

  // sync z URL (list & search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    const l = params.get("list") || "popular";
    setSearch(q);
    setList(l);
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  const navigateWithParams = (newList, newSearch) => {
    const params = new URLSearchParams();
    params.set("list", newList || "popular");

    if (newSearch && newSearch.trim() !== "") {
      params.set("search", newSearch.trim());
    }

    navigate(`/movies?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateWithParams(list, search);
    setMenuOpen(false);
  };

  const handleListChange = (e) => {
    const newList = e.target.value;
    setList(newList);
    navigateWithParams(newList, search);
  };

  return (
    <nav className="navbar">
      {/* LEWO – logo */}
      <div className="navbar-left" onClick={() => navigate("/")}>
        Movie Web App
      </div>

      {/* ŚRODEK – watchlist + wyszukiwarka */}
      <div className="navbar-center">
        <select
          value={list}
          onChange={handleListChange}
          className="navbar-watchlist-select"
        >
          {WATCHLISTS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Szukaj filmu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Szukaj</button>
        </form>
      </div>

      {/* PRAWO – logowanie / playlisty / wylogowanie */}
      <div className="navbar-right desktop-only">
        {!token ? (
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>
              Logowanie
            </button>
            <button className="nav-btn" onClick={() => navigate("/register")}>
              Rejestracja
            </button>
          </>
        ) : (
          <>
            {/* NOWY PRZYCISK PLAYLISTY */}
            <button
              className="nav-btn"
              onClick={() => navigate("/playlists")}
            >
              Playlisty
            </button>

            <span className="navbar-email">{email}</span>
            <button className="nav-btn" onClick={handleLogout}>
              Wyloguj
            </button>
          </>
        )}
      </div>

      {/* HAMBURGER (mobile) */}
      <div
        className="hamburger-button"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        ☰
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-watchlist">
            <select
              value={list}
              onChange={handleListChange}
              className="navbar-watchlist-select"
            >
              {WATCHLISTS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <form className="mobile-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Szukaj filmu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Szukaj</button>
          </form>

          {!token ? (
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
          ) : (
            <>
              {/* PLAYLISTY TAKŻE W MOBILE */}
              <button
                className="mobile-btn"
                onClick={() => {
                  navigate("/playlists");
                  setMenuOpen(false);
                }}
              >
                Playlisty
              </button>

              <div className="mobile-email">{email}</div>
              <button
                className="mobile-btn"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
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

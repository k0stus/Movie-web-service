// src/pages/Movies.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import "../styles/movieCard.css";
import {
  getPopularMovies,
  getPlaylists,
  createPlaylist,
  getMoviesByGenre,
  addToPlaylist,
} from "../api";

const WATCHLISTS = [
  { id: "popular", label: "Popularne", genreId: null },
  { id: "action", label: "Akcja", genreId: 28 },
  { id: "comedy", label: "Komedia", genreId: 35 },
  { id: "animation", label: "Animacja", genreId: 16 },
];

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuMovieId, setOpenMenuMovieId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(location.search);
        const listId = params.get("list") || "popular";
        const search = params.get("search") || "";
        setSearchTerm(search);

        const selected =
          WATCHLISTS.find((w) => w.id === listId) || WATCHLISTS[0];

        // 1) filmy z backendu: popularne albo po gatunku
        let data;
        if (!selected.genreId) {
          data = await getPopularMovies(1);
        } else {
          data = await getMoviesByGenre(selected.genreId, 1);
        }

        const list = Array.isArray(data) ? data : data.results || [];
        console.log("Movies raw from API:", list);

        const mapped = list
          .map((m) => {
            // bierzemy id z m.id albo m.ID
            let rawId = m.id ?? m.ID;

            if (rawId === undefined || rawId === null) {
              console.warn("Film bez ID – pomijam", m);
              return null;
            }

            // zamieniamy na string
            let idStr = String(rawId);

            // jeśli backend zwrócił np. "popular:1084242" -> bierzemy część po dwukropku
            if (idStr.includes(":")) {
              const parts = idStr.split(":");
              idStr = parts[parts.length - 1]; // ostatni fragment, np. "1084242"
            }

            const numericId = Number(idStr);
            if (Number.isNaN(numericId)) {
              console.warn(
                "Film z nieprawidłowym ID – pomijam",
                m,
                "idStr =",
                idStr
              );
              return null;
            }

            const posterPath = m.poster_path || m.posterPath || "";
            return {
              id: numericId, // trzymamy jako liczba
              title: m.title || "(bez tytułu)",
              poster: posterPath
                ? `https://image.tmdb.org/t/p/w342${posterPath}`
                : "",
            };
          })
          .filter(Boolean); // usuń null-e

        let filtered = mapped;
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter((m) =>
            (m.title || "").toLowerCase().includes(q)
          );
        }

        console.log("Movies mapped for UI:", filtered);
        setMovies(filtered);

        // 2) playlisty użytkownika
        if (isLoggedIn) {
          try {
            const pls = await getPlaylists();
            console.log("Playlists from API:", pls);
            setPlaylists(Array.isArray(pls) ? pls : []);
          } catch (err) {
            console.error("getPlaylists error:", err);
          }
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Nie udało się załadować filmów");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location.search, isLoggedIn]);

  const toggleMenu = (movieId) => {
    if (!isLoggedIn) {
      alert("Aby korzystać z playlist, zaloguj się.");
      return;
    }
    setOpenMenuMovieId((prev) => (prev === movieId ? null : movieId));
  };

  const handleAddToPlaylist = async (playlistId, movieId) => {
    try {
      await addToPlaylist(playlistId, movieId);
      alert("Film dodany do playlisty ✅");
      setOpenMenuMovieId(null);
    } catch (err) {
      console.error("addToPlaylist error:", err);
      alert(err.message || "Nie udało się dodać do playlisty");
    }
  };

  const handleCreatePlaylistAndAdd = async (movieId) => {
    try {
      const name = window.prompt("Nazwa nowej playlisty:");
      if (!name || !name.trim()) return;

      const pl = await createPlaylist(name.trim());
      setPlaylists((prev) => [...prev, pl]);
      await addToPlaylist(pl.id, movieId);
      alert("Stworzono playlistę i dodano film ✅");
      setOpenMenuMovieId(null);
    } catch (err) {
      console.error("createPlaylist/addToPlaylist error:", err);
      alert(err.message || "Nie udało się stworzyć playlisty");
    }
  };

  return (
    <>
      <Navbar />

      <div className="movies-container" style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Dostępne Filmy
        </h1>

        {searchTerm && (
          <p style={{ textAlign: "center", fontSize: "14px" }}>
            Wyniki wyszukiwania dla: <strong>{searchTerm}</strong>
          </p>
        )}

        {loading && <p style={{ textAlign: "center" }}>Ładowanie...</p>}
        {error && (
          <p
            className="error-message"
            style={{ textAlign: "center", color: "red" }}
          >
            {error}
          </p>
        )}

        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card-wrapper">
              {/* cała karta -> przejście do szczegółów */}
              <div
                onClick={() => {
                  console.log("Kliknięty film id =", movie.id);
                  navigate(`/movies/${movie.id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <MovieCard title={movie.title} poster={movie.poster} />
              </div>

              {/* plus w rogu */}
              <button
                type="button"
                className="playlist-plus-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(movie.id);
                }}
              >
                +
              </button>

              {/* menu playlist */}
              {openMenuMovieId === movie.id && (
                <div
                  className="playlist-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      className="playlist-menu-item"
                      onClick={() => handleAddToPlaylist(pl.id, movie.id)}
                    >
                      📁 {pl.name}
                    </div>
                  ))}

                  <div
                    className="playlist-menu-item playlist-menu-new"
                    onClick={() => handleCreatePlaylistAndAdd(movie.id)}
                  >
                    ➕ Nowa playlista...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          style={{
            marginTop: "20px",
            marginLeft: "20px",
            marginBottom: "20px",
          }}
          onClick={() => navigate("/")}
        >
          ← Powrót na stronę główną
        </button>
      </div>
    </>
  );
}

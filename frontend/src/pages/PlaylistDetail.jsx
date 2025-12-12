// src/pages/PlaylistDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { getPlaylist, getMovieDetails, removeFromPlaylist } from "../api";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        // 1) pobierz playlistę
        const pl = await getPlaylist(id);
        console.log("PlaylistDetail getPlaylist:", pl);
        setPlaylist(pl);

        const ids = Array.isArray(pl.movieIds) ? pl.movieIds : [];
        if (!ids.length) {
          setMovies([]);
          return;
        }

        // 2) pobierz szczegóły wszystkich filmów
        const details = await Promise.all(
          ids.map(async (movieId) => {
            try {
              const d = await getMovieDetails(movieId);
              return d;
            } catch (err) {
              console.error("getMovieDetails error for", movieId, err);
              return null; // ignorujemy ten film
            }
          })
        );

        // 3) mapowanie z zabezpieczeniami
        const mapped = details
          .filter(Boolean) // wyrzuć null-e
          .map((d) => {
            const movieData = d.data || d; // obsługa {data: {...}} i samego obiektu

            if (!movieData || !movieData.id) {
              return null;
            }

            const posterPath =
              movieData.poster_path || movieData.posterPath || "";

            return {
              id: movieData.id,
              title: movieData.title || "Bez tytułu",
              poster: posterPath
                ? `https://image.tmdb.org/t/p/w342${posterPath}`
                : "",
            };
          })
          .filter(Boolean); // wyrzuć null-e, jeśli coś poszło nie tak

        console.log("PlaylistDetail mapped movies:", mapped);
        setMovies(mapped);
      } catch (err) {
        console.error("PlaylistDetail load error:", err);
        setError(err.message || "Nie udało się załadować playlisty");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleRemove = async (movieId) => {
    try {
      await removeFromPlaylist(id, movieId);
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      alert(err.message || "Nie udało się usunąć filmu z playlisty");
    }
  };

  if (loading && !playlist && !error) {
    return (
      <>
        <Navbar />
        <p style={{ paddingTop: "100px", textAlign: "center" }}>
          Ładowanie...
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="movies-container" style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Playlista: {playlist?.name || "Nieznana"}
        </h1>

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
            <div key={movie.id} style={{ position: "relative" }}>
              <div
                onClick={() => navigate(`/movies/${movie.id}`)}
                style={{ cursor: "pointer" }}
              >
                <MovieCard title={movie.title} poster={movie.poster} />
              </div>
              <button
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  padding: "4px 8px",
                  fontSize: "12px",
                }}
                onClick={() => handleRemove(movie.id)}
              >
                Usuń
              </button>
            </div>
          ))}

          {(!movies || movies.length === 0) && !error && (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              Ta playlista nie ma jeszcze żadnych filmów.
            </p>
          )}
        </div>

        <button
          style={{
            marginTop: "20px",
            marginLeft: "20px",
            marginBottom: "20px",
          }}
          onClick={() => navigate("/playlists")}
        >
          ← Powrót do playlist
        </button>
      </div>
    </>
  );
}

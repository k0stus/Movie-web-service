// src/pages/Watchlist.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import {
  getWatchlist,
  getWatched,
  getMovieDetails,
} from "../api";

export default function Watchlist({ isWatched = false }) {
  const [items, setItems] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = isWatched ? await getWatched() : await getWatchlist();
        setItems(list);

        const details = await Promise.all(
          list.map((item) => getMovieDetails(item.movieId))
        );

        // backend zwraca { data: {...}, youtubeKey: ... }
        const mapped = details.map((d) => ({
          id: d.data.id,
          title: d.data.title,
          poster: d.data.poster_path
            ? `https://image.tmdb.org/t/p/w342${d.data.poster_path}`
            : "",
        }));

        setMovies(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isWatched]);

  return (
    <>
      <Navbar />
      <div className="movies-container" style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          {isWatched ? "Obejrzane filmy" : "Watchlista"}
        </h1>

        {loading && <p style={{ textAlign: "center" }}>Ładowanie...</p>}
        {error && <p className="error-message" style={{ textAlign: "center" }}>{error}</p>}

        <div className="movies-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movies/${movie.id}`)}
              style={{ cursor: "pointer" }}
            >
              <MovieCard title={movie.title} poster={movie.poster} />
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

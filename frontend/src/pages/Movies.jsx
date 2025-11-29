import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import "../styles/movieCard.css";
import { getPopularMovies } from "../api";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await getPopularMovies();
	      console.log("POPULAR:",data);
	      const mapped = data.map((m) => {
  const raw = m.posterPath || m.poster_path;

  let poster;
  if (!raw) {
    poster = "https://via.placeholder.com/300x450?text=Brak+Obrazka";
  } else if (raw.startsWith("http")) {
    poster = raw;
  } else {
    poster = `https://image.tmdb.org/t/p/w300${raw}`;
  }

  return {
    id: m.id,
    title: m.title,
    poster,
  };
});

        setMovies(mapped);
      } catch (err) {
        setError(err.message);
      }
    }

    loadMovies();
  }, []);

  return (
    <>
      <Navbar />

      <div className="movies-container" style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Dostępne Filmy
        </h1>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

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


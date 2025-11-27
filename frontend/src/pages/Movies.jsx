import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import "../styles/movieCard.css";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: fetch movies from API

    // mock for testing frontendu, delete after adding fetch
    setMovies([
  { id: 1, title: "Movie 1", poster: "https://placecats.com/300/200" },
  { id: 2, title: "movie 2", poster: "https://placecats.com/300/200" },
  { id: 3, title: "Movie 3", poster: "https://placecats.com/300/200" },
  { id: 4, title: "Movie 4", poster: "https://placecats.com/300/200" },
  { id: 5, title: "Movie 5", poster: "https://placecats.com/300/200" },
  { id: 6, title: "Movie 6", poster: "https://placecats.com/300/200" },
  { id: 7, title: "Movie 7", poster: "https://placecats.com/300/200" },
  { id: 8, title: "Movie 8", poster: "https://placecats.com/300/200" },
  { id: 9, title: "Movie 9", poster: "https://placecats.com/300/200" }
]);

  }, []);

  return (
    <>
      <Navbar />

      <div className="movies-container" style={{ paddingTop: "100px" }}>

        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Dostępne Filmy
        </h1>

        <div className="movies-grid">
          {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title}
          poster={movie.poster}
        />
          ))}
        </div>
                <button
          style={{
            marginTop: "20px",
            marginLeft: "20px",
            marginBottom: "20px"
          }}
          onClick={() => navigate("/")}
        >
          ← Powrót na stronę główną
        </button>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/movieDetail.css";
import { getMovieDetails } from "../api";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMovie() {
      try {
        const data = await getMovieDetails(id);
        console.log("MovieDetail API response:", data);

        const movieData = data.data || data; 
        const youtubeKey = data.youtubeKey || "";

        const mapped = {
          title: movieData.title,
          description: movieData.overview,
          rating: (movieData.vote_average || 0) / 2, 
          youtubeKey,
        };

        setMovie(mapped);
      } catch (err) {
        console.error("Error loading movie:", err);
        setError(err.message || "Nie udało się załadować filmu");
      }
    }

    loadMovie();
  }, [id]);

  if (error) {
    return (
      <>
        <Navbar />
        <p className="loading-text" style={{ color: "red" }}>
          {error}
        </p>
        <button className="back-button" onClick={() => navigate("/movies")}>
          ← Powrót do listy filmów
        </button>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <p className="loading-text">Ładowanie filmu...</p>
      </>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="star-container">
          <span
            className="star-filled"
            style={{
              width: `${
                i <= rating ? 100 : i - 1 < rating ? (rating % 1) * 100 : 0
              }%`,
            }}
          >
            ★
          </span>
          <span className="star-empty">★</span>
        </span>
      );
    }
    return stars;
  };

  const trailerKey = movie.youtubeKey;
  const trailerSrc = `https://www.youtube.com/embed/${trailerKey}`;

  return (
    <>
      <Navbar />
      <div className="movie-detail-container">
        <h1 className="movie-title">{movie.title}</h1>

        <div className="trailer-container">
          <iframe
            width="560"
            height="315"
            src={trailerSrc}
            title="YouTube trailer"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="movie-rating">
          {renderStars(movie.rating)}
          <span className="movie-rating-number">
            {movie.rating.toFixed(1)}/5
          </span>
        </div>

        <div className="movie-description-container">
          <p className="movie-description">{movie.description}</p>
        </div>

        <button className="back-button" onClick={() => navigate("/movies")}>
          ← Powrót do listy filmów
        </button>
      </div>
    </>
  );
}


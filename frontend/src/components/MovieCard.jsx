// src/components/MovieCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/movieCard.css";

export default function MovieCard({ id, title, poster }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <img src={poster} alt={title} className="movie-poster" />
      <h3 className="movie-card-title">{title}</h3>
    </div>
  );
}
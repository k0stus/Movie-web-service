// src/components/MovieCard.jsx
import React from "react";
import "../styles/movieCard.css";

export default function MovieCard({ title, poster }) {
  // jeśli brak plakatu albo śmieciowy URL -> placeholder
  const hasPoster = poster && typeof poster === "string" && poster.trim() !== "";
  const src = hasPoster
    ? poster
    : "https://via.placeholder.com/300x450?text=Brak+plakatu";

  return (
    <div className="movie-card">
      <img className="movie-poster" src={src} alt={title} />
      <h3 className="movie-title-card">{title}</h3>
    </div>
  );
}

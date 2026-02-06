import React from "react";

export default function MovieCard({ title, poster }) {
  return (
    <div className="movie-card">
      <img src={poster} alt={title} className="movie-poster" />
      <h3 className="movie-title">{title}</h3>
    </div>
  );
}

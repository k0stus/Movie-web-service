import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/movieDetail.css"; 


export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {


    // Mock data, TODO:  replaced with backend fetch 
    const moviesMock = [
      { id: 1, title: "Movie 1", description: "Opis filmu 1", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 4 },
      { id: 2, title: "Movie 2", description: "Opis filmu 2", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 3.9 },
      { id: 3, title: "Movie 3", description: "Opis filmu 3", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 5 },
      { id: 4, title: "Movie 4", description: "Opis filmu 4", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 2 },
      { id: 5, title: "Movie 5", description: "Opis filmu 5", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 3 },
      { id: 6, title: "Movie 6", description: "Opis filmu 6", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 4.5 },
      { id: 7, title: "Movie 7", description: "Opis filmu 7", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 1 },
      { id: 8, title: "Movie 8", description: "Opis filmu 8", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 5 },
      { id: 9, title: "Movie 9", description: "Opis filmu 9", trailer: "https://www.youtube.com/embed/J7UwSVsiwzI", rating: 2.2 },
    ];


    const selectedMovie = moviesMock.find((m) => m.id === parseInt(id));
    setMovie(selectedMovie);
  }, [id]);

  if (!movie) return <p className="loading-text">Ładowanie filmu...</p>;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="star-container">
          <span
            className="star-filled"
            style={{
              width: `${i <= rating ? 100 : i - 1 < rating ? (rating % 1) * 100 : 0}%`
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

  return (
    <>
      <Navbar />
      <div className="movie-detail-container">
        <h1 className="movie-title">{movie.title}</h1>

        <div className="trailer-container">
            <iframe
            width="560"
            height="315"
            src={movie.trailer}
            title="YouTube trailer"
            style={{ border: 0 }} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            ></iframe>
        </div>
        <div className="movie-rating">
          {renderStars(movie.rating)}
          <span className="movie-rating-number">{movie.rating}/5</span>
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
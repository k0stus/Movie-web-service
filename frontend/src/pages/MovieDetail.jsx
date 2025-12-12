// src/pages/MovieDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/movieDetail.css";
import {
  getMovieDetails,
  getComments,
  addComment,
  deleteComment,
} from "../api";

// Wyciąga userId z JWT w localStorage
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.sub || payload.userId || payload.id || null;
  } catch (e) {
    console.error("Cannot decode JWT:", e);
    return null;
  }
}

export default function MovieDetail() {
  const { id } = useParams(); // string z URL, np. "1084242"
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentUserId = getCurrentUserId();
  const currentUserEmail =
    (typeof window !== "undefined" && localStorage.getItem("email")) || null;

  useEffect(() => {
    if (!id) {
      setError("Brak ID filmu");
      return;
    }

    async function loadMovie() {
      try {
        setError("");

        // id jako string – backend zrobi strconv.Atoi
        const data = await getMovieDetails(id);

        // backend może zwracać {data: {...}, youtubeKey: "..."} albo sam obiekt
        const movieData = data?.data || data || {};
        const youtubeKey = data?.youtubeKey || movieData?.youtubeKey || "";

        const description =
          movieData.overview ||
          movieData.description ||
          movieData.plot ||
          "";

        const voteAvg =
          movieData.vote_average ?? movieData.voteAvg ?? 0;

        const mapped = {
          id: movieData.id,
          title: movieData.title,
          description,
          rating: Number(voteAvg) / 2,
          youtubeKey,
        };

        setMovie(mapped);
      } catch (err) {
        console.error("Error loading movie:", err);
        setError(err.message || "Nie udało się załadować filmu");
      }
    }

    async function loadComments() {
      try {
        setLoadingComments(true);

        const movieIdNum = Number(id);
        if (Number.isNaN(movieIdNum)) {
          setComments([]);
          return;
        }

        const data = await getComments(movieIdNum);
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoadingComments(false);
      }
    }

    loadMovie();
    loadComments();
  }, [id]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="movie-detail-container">
          <p className="loading-text" style={{ color: "red" }}>
            {error}
          </p>
          <button className="back-button" onClick={() => navigate("/movies")}>
            ← Powrót do listy filmów
          </button>
        </div>
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
  const trailerSrc = trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : "";

  // ----- DODAWANIE KOMENTARZA -----
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const movieIdNum = Number(id);
    if (Number.isNaN(movieIdNum)) {
      alert("Nieprawidłowe ID filmu (komentarz)");
      return;
    }

    setSendingComment(true);
    try {
      const created = await addComment(movieIdNum, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      alert(
        err.message ||
          "Nie udało się dodać komentarza. Upewnij się, że jesteś zalogowany."
      );
    } finally {
      setSendingComment(false);
    }
  };

  // ----- USUWANIE KOMENTARZA -----
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Na pewno chcesz usunąć komentarz?")) return;

    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
      alert(err.message || "Nie udało się usunąć komentarza");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="movie-detail-container">
        <h1 className="movie-title">{movie.title}</h1>

        <div className="trailer-container">
          {trailerSrc ? (
            <iframe
              width="560"
              height="315"
              src={trailerSrc}
              title="YouTube trailer"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <p>Brak trailera do tego filmu.</p>
          )}
        </div>

        <div className="movie-rating">
          {renderStars(movie.rating)}
          <span className="movie-rating-number">
            {Number.isFinite(movie.rating) ? movie.rating.toFixed(1) : "0.0"}/5
          </span>
        </div>

        {/* ✅ OPIS FILMU */}
        <div className="movie-description-container">
          <p className="movie-description">
            {movie.description?.trim()
              ? movie.description
              : "Brak opisu dla tego filmu."}
          </p>
        </div>

        {/* --- KOMENTARZE --- */}
        <div className="comments-section" style={{ marginTop: "30px" }}>
          <h2>Komentarze</h2>

          {currentUserId ? (
            <form
              onSubmit={handleAddComment}
              className="comment-form"
              style={{ marginBottom: "20px" }}
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Napisz komentarz..."
                rows={3}
                style={{
                  width: "100%",
                  resize: "vertical",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginBottom: "8px",
                }}
              />
              <button
                type="submit"
                disabled={sendingComment}
                style={{
                  padding: "6px 14px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#3498db",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {sendingComment ? "Wysyłanie..." : "Dodaj komentarz"}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: "14px" }}>
              Aby dodać komentarz, <strong>zaloguj się</strong>.
            </p>
          )}

          {loadingComments ? (
            <p>Ładowanie komentarzy...</p>
          ) : comments.length === 0 ? (
            <p>Brak komentarzy. Bądź pierwszy!</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {comments.map((c) => {
                const isOwner = currentUserId && c.userId === currentUserId;

                let emailToShow = c.userEmail;
                if (!emailToShow && isOwner && currentUserEmail) {
                  emailToShow = currentUserEmail;
                }

                const authorLabel = emailToShow
                  ? isOwner
                    ? `Autor: Ty (${emailToShow})`
                    : `Autor: ${emailToShow}`
                  : isOwner
                  ? "Autor: Ty"
                  : "Autor: Użytkownik";

                return (
                  <li
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "2px",
                      }}
                    >
                      {authorLabel}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                        marginBottom: "4px",
                      }}
                    >
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                    </div>

                    <div>{c.content}</div>

                    {isOwner && (
                      <button
                        style={{
                          marginTop: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          backgroundColor: "#e74c3c",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        disabled={deletingId === c.id}
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        {deletingId === c.id ? "Usuwanie..." : "Usuń"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button className="back-button" onClick={() => navigate("/movies")}>
          ← Powrót do listy filmów
        </button>
      </div>
    </>
  );
}

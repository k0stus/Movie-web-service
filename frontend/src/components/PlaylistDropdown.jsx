// src/components/PlaylistDropdown.jsx
import React, { useState } from "react";
import {
  markAsWatched,
  getPlaylists,
  createPlaylist,
  addToPlaylist,
} from "../api";

export default function PlaylistDropdown({ movieId }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  const toggleOpen = async () => {
    if (!isLoggedIn) {
      alert("Zaloguj się, aby korzystać z playlist.");
      return;
    }

    const willOpen = !open;
    setOpen(willOpen);
    setMessage("");

    if (willOpen && playlists.length === 0) {
      try {
        setLoading(true);
        const data = await getPlaylists();
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage(err.message || "Nie udało się pobrać playlist");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddWatched = async () => {
    try {
      await markAsWatched(movieId);
      setMessage("Dodano do 'Obejrzane' ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Nie udało się oznaczyć jako obejrzany");
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addToPlaylist(playlistId, movieId);
      setMessage("Dodano do playlisty ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Nie udało się dodać do playlisty");
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setCreating(true);
      const pl = await createPlaylist(newName.trim());
      setPlaylists((prev) => [...prev, pl]);
      setNewName("");
      setMessage(`Utworzono playlistę "${pl.name}"`);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Nie udało się stworzyć playlisty");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Przyciski – ładniejszy plus */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1px solid #ccc",
          backgroundColor: "#ffffff",
          color: "#333",
          fontSize: "18px",
          lineHeight: "18px",
          padding: 0,
          textAlign: "center",
          cursor: "pointer",
        }}
        title="Dodaj do playlisty"
      >
        +
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "34px",
            right: 0,
            zIndex: 9999, // wysoki, żeby nic go nie przykryło
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "8px",
            minWidth: "220px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Dodaj do:
          </div>

          {/* Specjalna "playlista" Obejrzane */}
          <button
            type="button"
            onClick={handleAddWatched}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "6px 8px",
              marginBottom: "4px",
              border: "none",
              background: "#f5f5f5",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            ✅ Obejrzane
          </button>

          <div
            style={{
              borderTop: "1px solid #eee",
              margin: "6px 0",
            }}
          />

          {loading ? (
            <p style={{ fontSize: "13px", margin: 0 }}>Ładowanie playlist...</p>
          ) : playlists.length === 0 ? (
            <p style={{ fontSize: "13px", margin: 0 }}>Brak playlist</p>
          ) : (
            <div style={{ maxHeight: "140px", overflowY: "auto" }}>
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleAddToPlaylist(pl.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    marginBottom: "4px",
                    border: "none",
                    background: "#fff",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  📁 {pl.name}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCreatePlaylist} style={{ marginTop: "6px" }}>
            <input
              type="text"
              placeholder="Nowa playlista..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: "100%",
                padding: "4px 6px",
                marginBottom: "4px",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              disabled={creating}
              style={{
                width: "100%",
                padding: "4px 6px",
                fontSize: "13px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#3498db",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {creating ? "Tworzenie..." : "Dodaj playlistę"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#333",
              }}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

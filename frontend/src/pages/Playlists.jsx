// src/pages/Playlists.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPlaylists, createPlaylist, deletePlaylist } from "../api";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getPlaylists();
        console.log("Playlists data from API:", data);

        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getPlaylists error:", err);
        setError(err.message || "Nie udało się pobrać playlist");
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const pl = await createPlaylist(newName.trim());
      console.log("Created playlist:", pl);

      if (pl) {
        setPlaylists((prev) => (Array.isArray(prev) ? [...prev, pl] : [pl]));
      }
      setNewName("");
    } catch (err) {
      console.error("createPlaylist error:", err);
      setError(err.message || "Nie udało się stworzyć playlisty");
    }
  };

  const handleDelete = async (playlistId, e) => {
    e.stopPropagation(); 

    if (!window.confirm("Na pewno chcesz usunąć tę playlistę?")) return;

    try {
      await deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    } catch (err) {
      console.error("deletePlaylist error:", err);
      setError(err.message || "Nie udało się usunąć playlisty");
    }
  };

  const safePlaylists = Array.isArray(playlists) ? playlists : [];

  return (
    <>
      <Navbar />
      <div className="movies-container" style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Twoje playlisty
        </h1>

        {error && (
          <p className="error-message" style={{ textAlign: "center", color: "red" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleCreate} style={{ marginBottom: "20px", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Nazwa nowej playlisty"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ padding: "8px 12px", width: "60%", maxWidth: "400px" }}
          />
          <button type="submit" style={{ marginLeft: "10px" }}>
            Dodaj playlistę
          </button>
        </form>

        {loading && <p style={{ textAlign: "center" }}>Ładowanie playlist...</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {safePlaylists.map((pl) => (
            <li
              key={pl.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "12px 16px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{ cursor: "pointer", flex: 1 }}
                onClick={() => navigate(`/playlists/${pl.id}`)}
              >
                <strong>{pl.name}</strong> ({pl.movieIds?.length || 0} filmów)
              </div>

              <button
                onClick={(e) => handleDelete(pl.id, e)}
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Usuń
              </button>
            </li>
          ))}

          {!loading && safePlaylists.length === 0 && !error && (
            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Nie masz jeszcze żadnych playlist.
            </p>
          )}
        </ul>
      </div>
    </>
  );
}

// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";

import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* LISTA FILMÓW */}
        <Route path="/movies" element={<Movies />} />

        {/* SZCZEGÓŁY FILMU – WAŻNE: tylko /movies/:id */}
        <Route path="/movies/:id" element={<MovieDetail />} />

        {/* PLAYLISTY */}
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

// src/api.js
const API_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------- AUTH -------

export async function registerUser(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Rejestracja nie powiodła się");
  }
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Logowanie nie powiodło się");
  }

  // backend zwraca { token: "..." }
  localStorage.setItem("token", data.token);
  localStorage.setItem("email", email);
  return data.token;
}

// ------- MOVIES -------

export async function getPopularMovies(page = 1) {
  const res = await fetch(`${API_URL}/movies/popular?page=${page}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać filmów");
  }

  return data;
}

export async function getMoviesByGenre(genreId, page = 1) {
  const res = await fetch(
    `${API_URL}/movies/genre?genreId=${genreId}&page=${page}`
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać filmów dla gatunku");
  }

  return data;
}

export async function getMovieDetails(id) {
  const numericId = Number(id);
  const res = await fetch(`${API_URL}/movies/${numericId}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać szczegółów filmu");
  }

  return data; // { data: ..., youtubeKey: "..." }
}

// ------- WATCHLIST & WATCHED -------

export async function addToWatchlist(movieId) {
  const res = await fetch(`${API_URL}/lists/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ movieId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się dodać do watchlisty");
  }
}

export async function getWatchlist() {
  const res = await fetch(`${API_URL}/lists/watchlist`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać watchlisty");
  }

  // [{ id, userId, movieId, createdAt }]
  return data;
}

export async function markAsWatched(movieId) {
  const res = await fetch(`${API_URL}/lists/watched`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ movieId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się oznaczyć jako obejrzany");
  }
}

export async function getWatched() {
  const res = await fetch(`${API_URL}/lists/watched`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać obejrzanych");
  }

  return data;
}

// ------- PLAYLISTY -------

export async function createPlaylist(name) {
  const res = await fetch(`${API_URL}/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się stworzyć playlisty");
  }

  return data; // { id, name, movieIds, ... }
}

export async function getPlaylists() {
  const res = await fetch(`${API_URL}/playlists`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać playlist");
  }

  return data; // [Playlist...]
}

export async function getPlaylist(id) {
  const res = await fetch(`${API_URL}/playlists/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać playlisty");
  }

  return data;
}

export async function addToPlaylist(playlistId, movieId) {
  const res = await fetch(`${API_URL}/playlists/${playlistId}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ movieId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się dodać do playlisty");
  }
}

export async function removeFromPlaylist(playlistId, movieId) {
  const res = await fetch(`${API_URL}/playlists/${playlistId}/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ movieId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 204) {
    throw new Error(data.error || "Nie udało się usunąć z playlisty");
  }
}

export async function deletePlaylist(playlistId) {
  const res = await fetch(`/api/playlists/${playlistId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(), 
    },
  });

  if (res.status === 204) return;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Nie udało się usunąć playlisty");
}

// ------- KOMENTARZE -------

export async function getComments(movieId) {
  const numericId = Number(movieId);
  const res = await fetch(`${API_URL}/comments/${numericId}`);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się pobrać komentarzy");
  }

  return Array.isArray(data) ? data : [];
}

export async function addComment(movieId, content) {
  const numericId = Number(movieId);
  const res = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ movieId: numericId, content }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nie udało się dodać komentarza");
  }

  return data; // pojedynczy komentarz
}

export async function deleteComment(commentId) {
  const res = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 204) {
    throw new Error(data.error || "Nie udało się usunąć komentarza");
  }
}

const API_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Logowanie nie powiodło się");
  }

  const data = await res.json();
  return data.token;
}

export async function registerUser(email, name, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Rejestracja nie powiodła się");
  }
}


export async function getPopularMovies(page = 1) {
  const res = await fetch(`${API_URL}/movies/popular?page=${page}`);
  if (!res.ok) throw new Error("Nie udało się pobrać filmów");
  return res.json();
}

export async function getMovieDetails(id) {
  const res = await fetch(`${API_URL}/movies/${id}`);
  if (!res.ok) throw new Error("Nie udało się pobrać szczegółów filmu");
  return res.json();
}


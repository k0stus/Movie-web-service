import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Witamy w Movie Web App</h1>
      <p>To jest strona główna. Miłego przeglądania filmów!</p>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => alert("Funkcja wkrótce dostępna!")}
          style={{ marginRight: "10px" }}
        >
          Przeglądaj filmy
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{ marginRight: "10px" }}
        >
          Zaloguj się
        </button>

        <button onClick={() => navigate("/register")}>
          Zarejestruj się
        </button>
      </div>
    </div>
  );
}

export default Home;

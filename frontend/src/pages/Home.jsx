import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "120px" }}>
        <h1>Witamy w Movie Web App</h1>
        <p>To jest strona główna. Miłego przeglądania filmów!</p>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/movies")}
            style={{ marginRight: "10px" }}
          >
            Przeglądaj filmy
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => navigate("/login")}>
          Logowanie
        </button>

        <button style={styles.button} onClick={() => navigate("/register")}>
          Rejestracja
        </button>
      </div>
    </nav>
  );
}
const styles = {
  nav: {
    width: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "15px 40px",  
    boxSizing: "border-box", 
    height: "70px",
    position: "fixed",
    top: 0,
    left: 0,

    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1000,
  },

  buttons: {
    display: "flex",
    gap: "20px", 
  },

  button: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    whiteSpace: "nowrap",
  },
};

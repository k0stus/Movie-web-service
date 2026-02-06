// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (value) => {
    if (!value) return "Email jest wymagany";
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) return "Nieprawidłowy format email";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Hasło jest wymagane";
    if (value.length < 6) return "Hasło musi mieć minimum 6 znaków";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passErr);
    setFormError("");

    if (emailErr || passErr) return;

    try {
      setLoading(true);
      const token = await loginUser(email, password);
      // zapis do AuthContext + localStorage
      login(email, token);
      navigate("/movies");
    } catch (err) {
      console.error("Login error:", err);
      setFormError(err.message || "Logowanie nie powiodło się");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Logowanie</h2>

        {formError && <p className="error-message">{formError}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="error-message">{emailError}</p>}

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <p className="error-message">{passwordError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => navigate("/")}>Powrót do strony głównej</button>
      </div>
    </div>
  );
}


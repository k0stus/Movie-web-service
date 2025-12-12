import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

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

  const validateConfirm = (pass, confirm) => {
    if (!confirm) return "Potwierdzenie hasła jest wymagane";
    if (pass !== confirm) return "Hasła nie są takie same";
    return "";
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setFormError("");

  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  const confirmErr = validateConfirm(password, confirmPassword);

  setEmailError(emailErr);
  setPasswordError(passErr);
  setConfirmError(confirmErr);

  if (emailErr || passErr || confirmErr) return;

  try {
    await registerUser(email, password);
    navigate("/login");
  } catch (err) {
    setFormError(err.message);
  }
};


  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Rejestracja</h2>

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

        <input
          type="password"
          placeholder="Potwierdź hasło"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmError && <p className="error-message">{confirmError}</p>}

        <button type="submit">Zarejestruj się</button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => navigate("/")}>
          Powrót do strony głównej
        </button>
      </div>
    </div>
  );
}


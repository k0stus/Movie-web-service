import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

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

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        setEmailError(emailErr);
        setPasswordError(passErr);

        if (!emailErr && !passErr) {
            console.log("fetch do backendu");
            // TODO: dodac integracje z backendem
        }
    };

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Logowanie</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {emailError && <p className="error-message">{emailError}</p>}

                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={handlePasswordChange}
                />
                {passwordError && <p className="error-message">{passwordError}</p>}

                <button type="submit">Zaloguj się</button>
            </form>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button onClick={() => navigate("/")}>Powrót do strony głównej</button>
            </div>
        </div>
    );
}
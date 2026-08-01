import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Failed to create account. Please try again.";
  }
}

export default function Signup() {
  const emailRef           = useRef();
  const passwordRef        = useRef();
  const confirmPasswordRef = useRef();
  const { signup }         = useAuth();
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      return setError("Passwords do not match.");
    }
    setError("");
    setLoading(true);
    try {
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    border: "1.5px solid #b2dfdb",
    outline: "none",
    fontSize: "1rem",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 32px #00968822",
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: "420px",
      }}>
        <h2 style={{
          color: "#00695c",
          fontWeight: 800,
          fontSize: "1.8rem",
          marginBottom: "0.4rem",
          textAlign: "center",
        }}>
          Create Account
        </h2>
        <p style={{ textAlign: "center", color: "#777", marginBottom: "1.8rem", fontSize: "0.95rem" }}>
          Join Natural Cocos today
        </p>

        {error && (
          <div style={{
            background: "#fdecea",
            color: "#c62828",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            marginBottom: "1.2rem",
            fontSize: "0.92rem",
            border: "1px solid #ef9a9a",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem", color: "#444", fontSize: "0.95rem" }}>
              Email address
            </label>
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#00897b")}
              onBlur={e  => (e.target.style.borderColor = "#b2dfdb")}
            />
          </div>

          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem", color: "#444", fontSize: "0.95rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#00897b")}
                onBlur={e  => (e.target.style.borderColor = "#b2dfdb")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#666",
                  fontSize: 18,
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.88 5.16C11.03 5.05 12.23 5 13.5 5c5.5 0 8.5 5.5 8.5 7s-3 7-8.5 7c-1.27 0-2.47-.05-3.62-.16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1.6rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem", color: "#444", fontSize: "0.95rem" }}>
              Confirm password
            </label>
            <div style={{ position: "relative" }}>
              <input
                ref={confirmPasswordRef}
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Repeat your password"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#00897b")}
                onBlur={e  => (e.target.style.borderColor = "#b2dfdb")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#666",
                  fontSize: 18,
                }}
              >
                {showConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.88 5.16C11.03 5.05 12.23 5 13.5 5c5.5 0 8.5 5.5 8.5 7s-3 7-8.5 7c-1.27 0-2.47-.05-3.62-.16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(90deg, #00695c 0%, #43a047 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              letterSpacing: "0.03em",
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.4rem", color: "#555", fontSize: "0.95rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00695c", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

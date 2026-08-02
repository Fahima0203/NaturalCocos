import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function OrderFailed() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const reason = state?.reason || "Your payment could not be completed.";
  const amount = state?.amount;

  return (
    <div style={{
      minHeight: "80vh",
      background: "linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px #e6510018",
        padding: "3rem 2.5rem",
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef6c00, #e65100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          fontSize: "2.2rem",
          color: "#fff",
          fontWeight: 900,
        }}>
          ✕
        </div>

        <h1 style={{ color: "#e65100", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem" }}>
          Payment Failed
        </h1>
        <p style={{ color: "#555", fontSize: "1.02rem", marginBottom: "1.5rem" }}>
          {reason}
        </p>

        {amount != null && (
          <div style={{
            background: "#fff8f0", borderRadius: 10,
            padding: "0.9rem 1.2rem", marginBottom: "1.8rem",
            border: "1px solid #ffe0b2", fontSize: "0.95rem", color: "#444",
          }}>
            Amount: <strong>₹ {Number(amount).toLocaleString("en-IN")}</strong>
          </div>
        )}

        <p style={{ color: "#777", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Your cart items are still saved. You can try again with a different
          card or payment method, or reach out if the issue persists.
        </p>

        <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/checkout")}
            style={{
              background: "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              borderRadius: 8,
              padding: "0.75rem 1.8rem",
              fontSize: "0.97rem",
              cursor: "pointer",
            }}
          >
            Retry Payment
          </button>
          <a
            href="https://wa.me/919445676371?text=Hi%2C%20I%20had%20a%20payment%20issue%20while%20placing%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: "2px solid #e65100",
              color: "#e65100",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 8,
              padding: "0.73rem 1.8rem",
              fontSize: "0.97rem",
              background: "transparent",
            }}
          >
            Contact Support
          </a>
        </div>

        <Link
          to="/cart"
          style={{
            display: "block", textAlign: "center",
            marginTop: "1.4rem", color: "#009688",
            fontWeight: 600, textDecoration: "none", fontSize: "0.9rem",
          }}
        >
          ← Back to Cart
        </Link>
      </div>
    </div>
  );
}

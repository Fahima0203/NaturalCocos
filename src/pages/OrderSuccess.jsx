import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // Guard: redirect home if page is accessed directly without order state
  useEffect(() => {
    if (!state?.orderId) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, email } = state;

  return (
    <div style={{
      minHeight: "80vh",
      background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px #00968818",
        padding: "3rem 2.5rem",
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
        animation: "fadeUp 0.5s ease both",
      }}>
        {/* Animated checkmark circle */}
        <div style={{
          width: 80, height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #43a047, #00695c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          animation: "popIn 0.55s ease both",
          fontSize: "2.2rem",
          color: "#fff",
          fontWeight: 900,
        }}>
          ✓
        </div>

        <h1 style={{
          color: "#00695c",
          fontWeight: 800,
          fontSize: "2rem",
          marginBottom: "0.5rem",
        }}>
          Order Placed!
        </h1>
        <p style={{ color: "#555", fontSize: "1.05rem", marginBottom: "1.8rem" }}>
          Thank you for your order. Our team will be in touch shortly.
        </p>

        {/* Order detail card */}
        <div style={{
          background: "#f5faf5",
          borderRadius: 12,
          padding: "1.2rem 1.5rem",
          marginBottom: "1.6rem",
          textAlign: "left",
          border: "1px solid #e0f2f1",
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 2 }}>
              Order Number
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: "0.97rem",
              color: "#00695c",
              wordBreak: "break-all",
              letterSpacing: "0.02em",
            }}>
              #{orderId}
            </div>
          </div>
          {email && (
            <div>
              <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 2 }}>
                Confirmation sent to
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#333" }}>
                {email}
              </div>
            </div>
          )}
        </div>

        <p style={{ color: "#777", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          We have received your details. Our team will now review your order and
          send processing, dispatch, and delivery updates. Keep your order number
          handy for reference.
        </p>

        <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            to="/"
            style={{
              background: "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 8,
              padding: "0.75rem 1.8rem",
              fontSize: "0.97rem",
            }}
          >
            Back to Home
          </Link>
          <Link
            to="/#featured-products"
            style={{
              border: "2px solid #00695c",
              color: "#00695c",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 8,
              padding: "0.73rem 1.8rem",
              fontSize: "0.97rem",
              background: "transparent",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

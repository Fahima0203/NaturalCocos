import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { productSections } from "../data/productSections";
import QuantitySelector from "../components/QuantitySelector";
import { cartTotalWeightKg, calcShippingByWeight } from "../utils/shipping";

// Look up the first product image from the local import map
function getProductImage(section, name) {
  const sec  = productSections.find((s) => s.title === section);
  const prod = sec?.products?.find((p) => p.name === name);
  return prod?.images?.[0] ?? null;
}

function buildWhatsappCartMessage(cartItems, totalPrice, shippingCost) {
  const lines = cartItems.map(
    (item) => `• ${item.name} (${item.section}) × ${item.quantity} — ₹ ${(item.priceValue * item.quantity).toLocaleString("en-IN")}`
  );
  lines.push("");
  lines.push(`Estimated Subtotal: ₹ ${totalPrice.toLocaleString("en-IN")}`);
  lines.push(`Estimated Shipping: ₹ ${shippingCost.toLocaleString("en-IN")}`);
  lines.push("");
  lines.push("I'd like to place this order — please confirm availability and total.");
  return lines.join("\n");
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
      <div style={{
        width: 48, height: 48,
        border: "5px solid #e0f2f1",
        borderTop: "5px solid #009688",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Cart() {
  const { cartItems, cartLoading, cartError, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const totalWeightKg = cartTotalWeightKg(cartItems);
  const shippingCost  = calcShippingByWeight(totalWeightKg);
  const estimatedTotal = totalPrice + shippingCost;

  if (cartLoading) return <Spinner />;

  return (
    <div style={{ minHeight: "80vh", background: "#f5faf5", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#00695c", fontWeight: 800, fontSize: "2rem", marginBottom: "1.5rem" }}>
          Your Cart
          {totalItems > 0 && (
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "#777", marginLeft: 12 }}>
              ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </span>
          )}
        </h1>

        {cartError && (
          <div style={{ background: "#fdecea", color: "#c62828", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", border: "1px solid #ef9a9a" }}>
            {cartError}
          </div>
        )}

        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
            <h2 style={{ color: "#555", fontWeight: 600, marginBottom: "0.5rem" }}>Your cart is empty</h2>
            <p style={{ color: "#888", marginBottom: "1.5rem" }}>Browse our products and add items to your cart.</p>
            <Link
              to="/#featured-products"
              style={{
                background: "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
                color: "#fff",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: 8,
                padding: "0.75rem 2rem",
                fontSize: "1rem",
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* ── Cart layout ── */
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* ── Items list ── */}
            <div style={{ flex: "1 1 580px" }}>
              {cartItems.map((item) => {
                const img      = getProductImage(item.section, item.name);
                const subtotal = item.priceValue * item.quantity;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 2px 12px #00968811",
                      padding: "1rem 1.2rem",
                      marginBottom: "1rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Product image */}
                    <div style={{
                      width: 90, height: 90, flexShrink: 0,
                      borderRadius: 8, overflow: "hidden",
                      background: "#f0f7f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {img ? (
                        <img src={img} alt={item.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "2rem" }}>📦</span>
                      )}
                    </div>

                    {/* Name + section */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#00695c" }}>{item.name}</div>
                      <div style={{ fontSize: "0.88rem", color: "#777", marginBottom: 4 }}>{item.section}</div>
                      <div style={{ fontSize: "0.92rem", color: "#444" }}>
                        Unit price: <strong>{item.price}</strong>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <QuantitySelector
                      quantity={item.quantity}
                      onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                      onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                      onRemove={() => removeFromCart(item.id)}
                      decreaseDisabled={false}
                    />

                    {/* Subtotal */}
                    <div style={{ minWidth: 90, textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>Subtotal</div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#00695c" }}>
                        ₹ {subtotal.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                      style={{
                        background: "none", border: "none",
                        color: "#e53935", cursor: "pointer",
                        fontSize: "1.3rem", lineHeight: 1,
                        padding: "0.2rem 0.4rem",
                        borderRadius: 6,
                        transition: "background 0.15s",
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fdecea")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <DeleteOutlineIcon style={{ fontSize: 20 }} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Order summary ── */}
            <div style={{
              flex: "0 1 300px",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px #00968811",
              padding: "1.5rem",
              position: "sticky",
              top: 80,
            }}>
              <h3 style={{ fontWeight: 800, color: "#00695c", marginBottom: "1rem", fontSize: "1.2rem" }}>Order Summary</h3>

              <div style={{ borderTop: "1px solid #e0f2f1", paddingTop: "1rem" }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.92rem", color: "#444" }}>
                    <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹ {(item.priceValue * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: "2px solid #e0f2f1",
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.92rem",
                color: "#555",
              }}>
                <span>Estimated Shipping ({totalWeightKg.toFixed(2)} kg)</span>
                <span>₹ {shippingCost.toLocaleString("en-IN")}</span>
              </div>

              <div style={{
                marginTop: "0.6rem",
                paddingTop: "0.6rem",
                borderTop: "1px solid #e0f2f1",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "#00695c",
              }}>
                <span>Estimated Total</span>
                <span>₹ {estimatedTotal.toLocaleString("en-IN")}</span>
              </div>

              <p style={{ fontSize: "0.78rem", color: "#999", marginTop: 6, marginBottom: "1.2rem" }}>
                * Final price confirmed on checkout.
              </p>

              <button
                onClick={() => navigate("/checkout")}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Proceed to Checkout →
              </button>

              <a
                href={`https://wa.me/919445676371?text=${encodeURIComponent(buildWhatsappCartMessage(cartItems, totalPrice, shippingCost))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  padding: "0.7rem",
                  marginTop: "0.7rem",
                  background: "#e8f5e9",
                  color: "#25D366",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  border: "1px solid #c8e6c9",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                💬 Share Cart on WhatsApp
              </a>

              <Link
                to="/#featured-products"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "0.8rem",
                  color: "#009688",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.93rem",
                }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

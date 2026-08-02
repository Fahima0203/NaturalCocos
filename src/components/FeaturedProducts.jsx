import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productSections } from "../data/productSections";
import { productDetails } from "../data/productDetails";
import QuantitySelector from "./QuantitySelector";

// ── Products shown in the featured section on the Home page ──────────────────
// Add more objects here when you want to feature additional products.
const FEATURED = [
  {
    section:     "Cocopeat Blocks",
    name:        "5 Kg",
    badge:       "Best Seller",
    description: "Expands upto ~85 L of growing medium. Ideal for horticulture, farms & hydroponics.",
  },
  {
    section:     "Cocopeat Blocks",
    name:        "1 Kg",
    badge:       "Retail Pack",
    description: "Compact block that yields ~17 L. Perfect for home gardens & potted plants.",
  },
];

export default function FeaturedProducts() {
  const { currentUser } = useAuth();
  const { addToCart }   = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If navigated with a hash or state requesting the featured section,
  // scroll it into view when this component mounts.
  useEffect(() => {
    const want = location.hash === "#featured-products" || location?.state?.scrollToFeatured;
    if (!want) return;
    const el = document.getElementById("featured-products");
    if (el) {
      // timeout ensures layout has settled before scrolling
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }, [location]);

  // Track loading / success state per product
  const [busyId,  setBusyId]  = useState(null); // product name (or "buy_<name>")
  const [addedId, setAddedId] = useState(null); // product name just added
  // Per-product local quantity (used before adding to cart)
  const [localQty, setLocalQty] = useState({}); // { [productName]: number }

  function getQty(name) { return localQty[name] ?? 1; }
  function setQty(name, val) {
    setLocalQty(prev => ({ ...prev, [name]: Math.max(1, val) }));
  }

  async function handleAddToCart(sectionTitle, name, price) {
    if (!currentUser) {
      navigate("/login", { state: { from: location } });
      return;
    }
    const qty = getQty(name);
    setBusyId(name);
    try {
      await addToCart(sectionTitle, name, price, qty);
      setAddedId(name);
      setQty(name, 1); // reset local qty after adding
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      console.error("FeaturedProducts — addToCart failed:", err);
    }
    setBusyId(null);
  }

  async function handleBuyNow(sectionTitle, name, price) {
    if (!currentUser) {
      navigate("/login", { state: { from: location } });
      return;
    }
    const qty = getQty(name);
    setBusyId(`buy_${name}`);
    try {
      await addToCart(sectionTitle, name, price, qty);
      navigate("/checkout");
    } catch (err) {
      console.error("FeaturedProducts — buyNow failed:", err);
      setBusyId(null);
    }
  }

  return (
    <section id="featured-products" className="fp-section" style={{
      background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
      padding: "3rem 1rem",
    }}>
      <style>{`
        @keyframes fp-pop {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        .fp-card {
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .fp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 44px rgba(0,105,92,0.16) !important;
        }
        @media (max-width: 600px) {
          .fp-section { padding: 2rem 0.75rem !important; }
          .fp-header { margin-bottom: 1.6rem !important; }
          .fp-header h2 { font-size: 1.5rem !important; }
          .fp-header p { font-size: 0.92rem !important; }
          .fp-cards { gap: 1rem !important; }
          .fp-card-body { padding: 1rem 1.1rem 1.2rem !important; gap: 8px !important; }
          .fp-card-img { height: 160px !important; }
          .fp-trust { gap: 1rem !important; margin-top: 1.6rem !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Section header ── */}
        <div className="fp-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(90deg,#00695c,#43a047)",
            color: "#fff",
            borderRadius: 20,
            padding: "4px 18px",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            marginBottom: 14,
            textTransform: "uppercase",
          }}>
            Available for Direct Purchase
          </span>
          <h2 style={{
            color: "#00695c",
            fontWeight: 900,
            fontSize: "2rem",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            🛒 Shop Cocopeat Blocks
          </h2>
          <p style={{
            color: "#555",
            fontSize: "1.02rem",
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Premium quality, export-grade cocopeat. Order directly and enjoy
            fast delivery across India.
          </p>
        </div>

        {/* ── Product cards ── */}
        <div className="fp-cards" style={{
          display: "flex",
          gap: "1.8rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {FEATURED.map(({ section: sectionTitle, name, badge, description }) => {
            const sec    = productSections.find(s => s.title === sectionTitle);
            const prod   = sec?.products?.find(p => p.name === name);
            const detail = productDetails.find(
              d => d.section === sectionTitle && d.name === name
            );
            const img        = prod?.images?.[0];
            const price      = detail?.price || "Contact for price";
            const productUrl = `/products/${encodeURIComponent(sectionTitle)}/${encodeURIComponent(name)}`;
            const isBusy     = busyId === name || busyId === `buy_${name}`;
            const isAdded    = addedId === name;

            return (
              <div
                key={name}
                className="fp-card"
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 4px 28px rgba(0,105,92,0.10)",
                  width: "100%",
                  maxWidth: 380,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Product image */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={img}
                    alt={`${name} Cocopeat Block`}
                    loading="lazy"
                    className="fp-card-img"
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Badge */}
                  <span style={{
                    position: "absolute", top: 14, left: 14,
                    background: "linear-gradient(90deg,#00695c,#43a047)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.77rem",
                    borderRadius: 20,
                    padding: "4px 12px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {badge}
                  </span>
                </div>

                {/* Card content */}
                <div className="fp-card-body" style={{
                  padding: "1.2rem 1.4rem 1.4rem",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <h3 style={{
                    fontWeight: 800,
                    fontSize: "1.4rem",
                    color: "#00695c",
                    margin: 0,
                  }}>
                    {name} Cocopeat Block
                  </h3>

                  <p style={{
                    color: "#555",
                    fontSize: "0.96rem",
                    margin: 0,
                    lineHeight: 1.55,
                  }}>
                    {description}
                  </p>

                  {/* ── Price + quantity selector, same row ── */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    margin: "5px 0px",
                  }}>
                    <span style={{
                      fontSize: "1.08rem",
                      fontWeight: 700,
                      color: "#00695c",
                    }}>
                      {price}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.85rem", color: "#555", fontWeight: 600 }}>Qty:</span>
                      <QuantitySelector
                        quantity={getQty(name)}
                        onDecrease={() => setQty(name, getQty(name) - 1)}
                        onIncrease={() => setQty(name, getQty(name) + 1)}
                        decreaseDisabled={getQty(name) <= 1}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                    {/* Add to Cart */}
                    <button
                      onClick={() => handleAddToCart(sectionTitle, name, price)}
                      disabled={isBusy}
                      style={{
                        flex: "1 1 130px",
                        padding: "0.75rem 0.5rem",
                        background: isAdded
                          ? "linear-gradient(90deg,#388e3c,#2e7d32)"
                          : "linear-gradient(90deg,#ff6f00,#ffa000)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.97rem",
                        border: "none",
                        borderRadius: 9,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.75 : 1,
                        transition: "background 0.25s",
                        animation: isAdded ? "fp-pop 0.3s ease" : "none",
                      }}
                    >
                      {isAdded
                        ? "✓ Added!"
                        : busyId === name
                          ? "Adding…"
                          : "🛒 Add to Cart"}
                    </button>

                    {/* Buy Now */}
                    <button
                      onClick={() => handleBuyNow(sectionTitle, name, price)}
                      disabled={isBusy}
                      style={{
                        flex: "1 1 100px",
                        padding: "0.75rem 0.5rem",
                        background: "linear-gradient(90deg,#00695c,#43a047)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.97rem",
                        border: "none",
                        borderRadius: 9,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.75 : 1,
                        transition: "opacity 0.2s",
                      }}
                    >
                      {busyId === `buy_${name}` ? "Please wait…" : "⚡ Buy Now"}
                    </button>
                  </div>

                  {/* View full details */}
                  <Link
                    to={productUrl}
                    state={{ fromHome: true }}
                    style={{
                      cursor: "pointer",
                      display: "block",
                      textAlign: "center",
                      color: "#009688",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      marginTop: 2,
                    }}
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust badges ── */}
        <div className="fp-trust" style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
          marginTop: "2rem",
        }}>
          {["🌿 Export Quality", "🚚 Fast Delivery", "✅ Secure Payment", "📞 Dedicated Support"].map(badge => (
            <span key={badge} style={{
              color: "#00695c",
              fontWeight: 600,
              fontSize: "0.92rem",
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

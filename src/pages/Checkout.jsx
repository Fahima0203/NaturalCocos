import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productSections } from "../data/productSections";
import { createOrder, clearUserCart } from "../services/orderService";

// ── Shipping cost (weight slabs) ─────────────────────────────────────────────
function itemUnitWeightKg(item) {
  const source = `${item?.name || ""} ${item?.id || ""}`;
  const kgMatch = source.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (kgMatch) return Number(kgMatch[1]);

  const gMatch = source.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (gMatch) return Number(gMatch[1]) / 1000;

  return 0;
}

function cartTotalWeightKg(items) {
  const total = (items || []).reduce((sum, item) => {
    const unitKg = itemUnitWeightKg(item);
    return sum + unitKg * (item.quantity || 0);
  }, 0);

  return Number(total.toFixed(3));
}

function calcShippingByWeight(totalWeightKg) {
  const slabCharge = (kg) => {
    if (kg <= 0) return 0;
    if (kg <= 2) return 80;
    if (kg <= 5) return 150;
    if (kg <= 7) return 230;
    if (kg <= 8) return 300;
    return 380; // 9–12 kg
  };

  const roundedKg = Math.ceil(totalWeightKg);
  const full12KgBlocks = Math.floor(roundedKg / 12);
  const remainderKg = roundedKg % 12;

  return (full12KgBlocks * 380) + slabCharge(remainderKg);
}

// ── Product image lookup (mirrors Cart.jsx) ───────────────────────────────────
function getProductImage(section, name) {
  const sec  = productSections.find((s) => s.title === section);
  const prod = sec?.products?.find((p) => p.name === name);
  return prod?.images?.[0] ?? null;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function PageSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
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

// ── Inline-error form field wrapper ──────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{
        display: "block",
        fontWeight: 600,
        marginBottom: "0.3rem",
        color: "#444",
        fontSize: "0.92rem",
      }}>
        {label}
        {required && <span style={{ color: "#e53935", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ color: "#c62828", fontSize: "0.82rem", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Input style helper ────────────────────────────────────────────────────────
function inputSx(hasError, extra = {}) {
  return {
    width: "100%",
    padding: "0.62rem 0.9rem",
    borderRadius: 8,
    border: `1.5px solid ${hasError ? "#e53935" : "#b2dfdb"}`,
    outline: "none",
    fontSize: "0.97rem",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    background: "#fff",
    ...extra,
  };
}

// ── Form validation ───────────────────────────────────────────────────────────
function validate(f) {
  const e = {};
  if (!f.fullName.trim())
    e.fullName = "Full name is required.";
  if (!f.phone.trim())
    e.phone = "Phone number is required.";
  else if (!/^\+?[\d\s\-()]{7,20}$/.test(f.phone.trim()))
    e.phone = "Enter a valid phone number.";
  if (!f.address1.trim())
    e.address1 = "Address line 1 is required.";
  if (!f.city.trim())
    e.city = "City is required.";
  if (!f.state.trim())
    e.state = "State / Province is required.";
  if (!f.country.trim())
    e.country = "Country is required.";
  if (!f.postalCode.trim())
    e.postalCode = "Postal code is required.";
  else if (!/^\w{3,10}$/.test(f.postalCode.trim()))
    e.postalCode = "Enter a valid postal code (3–10 characters).";
  return e;
}

// ── Razorpay checkout.js script loader ───────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Checkout() {
  const { currentUser }  = useAuth();
  const { cartItems, cartLoading, totalPrice } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName:   "",
    phone:      "",
    company:    "",
    address1:   "",
    address2:   "",
    city:       "",
    state:      "",
    country:    "India",
    postalCode: "",
  });
  const [errors,     setErrors]     = useState({});
  const [placing,     setPlacing]     = useState(false);
  const [placingStep, setPlacingStep] = useState(""); // "payment" | "verifying" | "saving"
  const [placeError,  setPlaceError]  = useState("");

  // Clear field error on change
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // Focus/blur colour helpers
  const onFocus = (hasErr) => (e) => (e.target.style.borderColor = hasErr ? "#e53935" : "#00897b");
  const onBlur  = (hasErr) => (e) => (e.target.style.borderColor = hasErr ? "#e53935" : "#b2dfdb");

  // ── Empty-cart guard (all hooks must run before this) ─────────────────────
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div style={{
        minHeight: "80vh", background: "#f5faf5",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1rem",
      }}>
        <div style={{ fontSize: "3.5rem" }}>🛒</div>
        <h2 style={{ color: "#00695c", fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: "#777" }}>Add some products before checking out.</p>
        <Link to="/#featured-products" style={{
          background: "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
          color: "#fff", fontWeight: 700, textDecoration: "none",
          borderRadius: 8, padding: "0.75rem 2rem",
        }}>
          Browse Products
        </Link>
      </div>
    );
  }

  if (cartLoading) return <PageSpinner />;

  const subtotal      = totalPrice;
  const totalWeightKg = cartTotalWeightKg(cartItems);
  const shippingCost  = calcShippingByWeight(totalWeightKg);
  const grandTotal    = subtotal + shippingCost;
  const totalQty      = cartItems.reduce((s, i) => s + i.quantity, 0);

  async function handleProceedToPayment(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setPlaceError("");
    setPlacing(true);
    setPlacingStep("payment");

    // Guard: REACT_APP_RAZORPAY_KEY_ID must be set in .env.local
    if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
      setPlaceError(
        "Payment gateway is not configured. " +
        "Add REACT_APP_RAZORPAY_KEY_ID to your .env.local file and restart the dev server."
      );
      setPlacing(false);
      return;
    }

    // 1. Ensure Razorpay checkout.js is loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPlaceError(
        "Razorpay payment gateway could not be loaded. " +
        "If you have an ad blocker or content-blocking extension enabled, " +
        "please disable it for this page and try again."
      );
      setPlacing(false);
      return;
    }

    // 2. Create Razorpay order on the server (amount in ₹; server converts to paise)
    let rzpOrder;
    try {
      const res = await fetch("/api/create-razorpay-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          amount:   grandTotal,
          currency: "INR",
          receipt:  `rcpt_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      rzpOrder = data;
    } catch (err) {
      console.error("Create Razorpay order error:", err);
      setPlaceError("Could not initiate payment. Please try again.");
      setPlacing(false);
      return;
    }

    // 3. Open Razorpay checkout popup
    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount:      rzpOrder.amount,
      currency:    rzpOrder.currency,
      name:        "Natural Cocos",
      description: `Order — ${totalQty} item${totalQty !== 1 ? "s" : ""}`,
      order_id:    rzpOrder.orderId,
      prefill: {
        name:    form.fullName,
        email:   currentUser.email,
        contact: form.phone,
      },
      theme: { color: "#00695c" },

      // 4. On successful payment: verify on server → save to Firestore → clear cart → redirect
      handler: async function (response) {
        setPlacingStep("verifying");
        try {
          const verifyRes = await fetch("/api/verify-razorpay-payment", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error(verifyData.error || "Signature verification failed");
          }

          // Save confirmed order to Firestore
          setPlacingStep("saving");
          const orderId = await createOrder(currentUser.uid, {
            userEmail:         currentUser.email,
            shippingAddress:   { ...form },
            items: cartItems.map((item) => ({
              id:           item.id,
              section:      item.section,
              name:         item.name,
              price:        item.price,
              priceValue:   item.priceValue,
              quantity:     item.quantity,
              itemSubtotal: item.priceValue * item.quantity,
            })),
            subtotal,
            shippingCost,
            totalAmount:       grandTotal,
            orderStatus:       "Confirmed",
            paymentStatus:     "Paid",
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
          });

          await clearUserCart(currentUser.uid, cartItems);

          // Send confirmation emails (fire-and-forget — don't block navigation)
          fetch("/api/send-order-email", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type:               "order_confirmed",
              orderId,
              userEmail:          currentUser.email,
              items:              cartItems.map((item) => ({
                id:           item.id,
                section:      item.section,
                name:         item.name,
                price:        item.price,
                priceValue:   item.priceValue,
                quantity:     item.quantity,
                itemSubtotal: item.priceValue * item.quantity,
              })),
              shippingAddress:    { ...form },
              subtotal,
              shippingCost,
              totalAmount:        grandTotal,
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              createdAt:          new Date().toISOString(),
            }),
          }).catch((e) => console.warn("Email send failed:", e));

          navigate("/order-success", {
            state:   { orderId, email: currentUser.email },
            replace: true,
          });
        } catch (err) {
          console.error("Payment verify/save error:", err);
          setPlaceError(
            `Payment received but order confirmation failed. ` +
            `Please contact support with Payment ID: ${response.razorpay_payment_id}`
          );
          setPlacing(false);
        }
      },

      modal: {
        ondismiss: function () {
          setPlaceError("Payment was cancelled. Your order has not been placed.");
          setPlacing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      const desc = response.error?.description || "Payment failed";
      setPlaceError(`Payment failed: ${desc}`);
      setPlacing(false);

      // Alert business about the payment issue
      fetch("/api/send-order-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:              "payment_failed",
          orderId:           rzpOrder.orderId,
          userEmail:         currentUser.email,
          shippingAddress:   { ...form },
          totalAmount:       grandTotal,
          razorpayOrderId:   rzpOrder.orderId,
          razorpayPaymentId: response.error?.metadata?.payment_id || "",
          errorDescription:  desc,
        }),
      }).catch((e) => console.warn("Payment alert email failed:", e));
    });
    rzp.open();
    // placing remains true while popup is active — reset in handler, ondismiss, or payment.failed
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "80vh", background: "#f5faf5", padding: "2rem 1rem" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ color: "#00695c", fontWeight: 800, fontSize: "1.9rem", marginBottom: 4 }}>
            Checkout
          </h1>
          <p style={{ color: "#777", fontSize: "0.92rem" }}>
            Ordering as <strong>{currentUser?.email}</strong>
          </p>
        </div>

        {/* Global error */}
        {placeError && (
          <div style={{
            background: "#fdecea", color: "#c62828", borderRadius: 8,
            padding: "0.75rem 1rem", marginBottom: "1.2rem",
            border: "1px solid #ef9a9a", fontSize: "0.95rem",
          }}>
            {placeError}
          </div>
        )}

        <form onSubmit={handleProceedToPayment} noValidate style={{
          display: "flex", gap: "1.5rem",
          alignItems: "flex-start", flexWrap: "wrap",
        }}>

          {/* ══════════ LEFT: Shipping form ══════════ */}
          <div style={{ flex: "1 1 560px" }}>
            <div style={{
              background: "#fff", borderRadius: 12,
              boxShadow: "0 2px 12px #00968811", padding: "1.8rem",
            }}>
              <h2 style={{ fontWeight: 800, color: "#00695c", fontSize: "1.2rem", marginBottom: "1.4rem" }}>
                Shipping Information
              </h2>

              {/* Email — read-only, pre-filled */}
              <Field label="Email Address" required>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  readOnly
                  style={inputSx(false, { background: "#f5faf5", color: "#555", cursor: "default" })}
                />
              </Field>

              {/* Full name + Phone */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <Field label="Full Name" required error={errors.fullName}>
                    <input
                      name="fullName" type="text"
                      value={form.fullName} onChange={handleChange}
                      placeholder="Jane Smith"
                      style={inputSx(!!errors.fullName)}
                      onFocus={onFocus(!!errors.fullName)}
                      onBlur={onBlur(!!errors.fullName)}
                      disabled={placing}
                    />
                  </Field>
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input
                      name="phone" type="tel"
                      value={form.phone} onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={inputSx(!!errors.phone)}
                      onFocus={onFocus(!!errors.phone)}
                      onBlur={onBlur(!!errors.phone)}
                      disabled={placing}
                    />
                  </Field>
                </div>
              </div>

              {/* Company (optional) */}
              <Field label="Company / Organisation">
                <input
                  name="company" type="text"
                  value={form.company} onChange={handleChange}
                  placeholder="Optional"
                  style={inputSx(false)}
                  onFocus={onFocus(false)} onBlur={onBlur(false)}
                  disabled={placing}
                />
              </Field>

              {/* Address line 1 */}
              <Field label="Address Line 1" required error={errors.address1}>
                <input
                  name="address1" type="text"
                  value={form.address1} onChange={handleChange}
                  placeholder="Street address, P.O. box"
                  style={inputSx(!!errors.address1)}
                  onFocus={onFocus(!!errors.address1)}
                  onBlur={onBlur(!!errors.address1)}
                  disabled={placing}
                />
              </Field>

              {/* Address line 2 (optional) */}
              <Field label="Address Line 2">
                <input
                  name="address2" type="text"
                  value={form.address2} onChange={handleChange}
                  placeholder="Apartment, suite, building (optional)"
                  style={inputSx(false)}
                  onFocus={onFocus(false)} onBlur={onBlur(false)}
                  disabled={placing}
                />
              </Field>

              {/* City + State */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px" }}>
                  <Field label="City" required error={errors.city}>
                    <input
                      name="city" type="text"
                      value={form.city} onChange={handleChange}
                      placeholder="Chennai"
                      style={inputSx(!!errors.city)}
                      onFocus={onFocus(!!errors.city)}
                      onBlur={onBlur(!!errors.city)}
                      disabled={placing}
                    />
                  </Field>
                </div>
                <div style={{ flex: "1 1 180px" }}>
                  <Field label="State / Province" required error={errors.state}>
                    <input
                      name="state" type="text"
                      value={form.state} onChange={handleChange}
                      placeholder="Tamil Nadu"
                      style={inputSx(!!errors.state)}
                      onFocus={onFocus(!!errors.state)}
                      onBlur={onBlur(!!errors.state)}
                      disabled={placing}
                    />
                  </Field>
                </div>
              </div>

              {/* Country + Postal code */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <Field label="Country" required error={errors.country}>
                    <input
                      name="country" type="text"
                      value={form.country} onChange={handleChange}
                      placeholder="India"
                      style={inputSx(!!errors.country)}
                      onFocus={onFocus(!!errors.country)}
                      onBlur={onBlur(!!errors.country)}
                      disabled={placing}
                    />
                  </Field>
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <Field label="Postal Code" required error={errors.postalCode}>
                    <input
                      name="postalCode" type="text"
                      value={form.postalCode} onChange={handleChange}
                      placeholder="600001"
                      style={inputSx(!!errors.postalCode)}
                      onFocus={onFocus(!!errors.postalCode)}
                      onBlur={onBlur(!!errors.postalCode)}
                      disabled={placing}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Place Order button */}
            <button
              type="submit"
              disabled={placing}
              style={{
                width: "100%",
                padding: "0.95rem",
                marginTop: "1.4rem",
                background: placing
                  ? "#b2dfdb"
                  : "linear-gradient(90deg,#00695c 0%,#43a047 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.08rem",
                border: "none",
                borderRadius: 10,
                cursor: placing ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                transition: "opacity 0.2s",
              }}
            >
              {placing && (
                <span style={{
                  width: 18, height: 18,
                  border: "2.5px solid rgba(255,255,255,0.35)",
                  borderTop: "2.5px solid #fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                  flexShrink: 0,
                }} />
              )}
              {placing
                ? (placingStep === "verifying" ? "Verifying Payment…"
                  : placingStep === "saving"   ? "Saving Order…"
                  : "Preparing Payment…")
                : `Proceed to Payment — ₹ ${grandTotal.toLocaleString("en-IN")}`}
            </button>

            <p style={{ textAlign: "center", marginTop: "0.8rem", fontSize: "0.82rem", color: "#aaa" }}>
              By placing your order you agree to our terms and conditions.
            </p>
          </div>

          {/* ══════════ RIGHT: Order summary ══════════ */}
          <div style={{
            flex: "0 1 340px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px #00968811",
            padding: "1.5rem",
            position: "sticky",
            top: 80,
          }}>
            <h2 style={{ fontWeight: 800, color: "#00695c", fontSize: "1.2rem", marginBottom: "1.2rem" }}>
              Order Summary
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#777", marginLeft: 8 }}>
                ({totalQty} item{totalQty !== 1 ? "s" : ""})
              </span>
            </h2>

            {/* Item list */}
            <div style={{ borderTop: "1px solid #e0f2f1", paddingTop: "1rem", marginBottom: "0.5rem" }}>
              {cartItems.map((item) => {
                const img     = getProductImage(item.section, item.name);
                const itemSub = item.priceValue * item.quantity;
                return (
                  <div key={item.id} style={{
                    display: "flex", gap: "0.75rem",
                    alignItems: "center", marginBottom: "0.9rem",
                  }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      borderRadius: 8, overflow: "hidden",
                      background: "#f0f7f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {img
                        ? <img src={img} alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "1.5rem" }}>📦</span>
                      }
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: "0.9rem", color: "#333",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.77rem", color: "#888" }}>{item.section}</div>
                      <div style={{ fontSize: "0.82rem", color: "#555" }}>
                        {item.price} × {item.quantity}
                      </div>
                    </div>

                    {/* Item subtotal */}
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#00695c", flexShrink: 0 }}>
                      ₹ {itemSub.toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1.5px solid #e0f2f1", paddingTop: "0.9rem" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: 8, fontSize: "0.93rem", color: "#555",
              }}>
                <span>Subtotal</span>
                <span>₹ {subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: 4,
                fontSize: "0.93rem", color: "#555",
              }}>
                <span>Shipping</span>
                <span>
                  ₹ {shippingCost.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{
                fontSize: "0.76rem", color: "#aaa",
                textAlign: "right", marginBottom: 12,
              }}>
                Weight slab applied ({totalWeightKg.toFixed(2)} kg)
              </div>

              <div style={{
                borderTop: "2px solid #e0f2f1",
                paddingTop: 10,
                display: "flex", justifyContent: "space-between",
                fontWeight: 800, fontSize: "1.15rem", color: "#00695c",
              }}>
                <span>Grand Total</span>
                <span>₹ {grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Back to cart link */}
            <Link
              to="/cart"
              style={{
                display: "block", textAlign: "center",
                marginTop: "1rem", color: "#009688",
                fontWeight: 600, textDecoration: "none", fontSize: "0.9rem",
              }}
            >
              ← Edit Cart
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

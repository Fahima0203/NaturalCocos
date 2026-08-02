import { useState } from "react";

const DEFAULT_FAQS = [
  {
    q: "How long does delivery take?",
    a: "Domestic orders within India are typically dispatched within 6–8 business days. Export/bulk orders vary by destination — contact us on WhatsApp for an exact timeline.",
  },
  {
    q: "Do you offer bulk / wholesale pricing?",
    a: "Yes. Retail cart pricing is shown online; for bulk or export quantities, use \"Get Latest Price\" or \"Request a Quotation\" to get volume-based pricing.",
  },
  {
    q: "How are products packaged for shipping?",
    a: "Cocopeat blocks are compressed and shrink-wrapped; loose/powder products are packed in sealed bags or bales. Custom packaging and OEM labels are available on request.",
  },
  {
    q: "What is your return / refund policy?",
    a: "Since products are agricultural/export goods, returns are handled case-by-case. If an order arrives damaged or incorrect, contact us within 48 hours with photos for a replacement or refund.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Online orders are processed securely through Razorpay (cards, UPI, net banking, wallets). For bulk/export orders, bank transfer can also be arranged.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e0f2f1" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "none", border: "none",
          padding: "0.9rem 0.2rem", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 700, color: "#00695c", fontSize: "0.98rem" }}>{q}</span>
        <span style={{ color: "#009688", fontSize: "1.1rem" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p style={{ margin: "0 0 1rem", color: "#555", fontSize: "0.92rem", lineHeight: 1.6 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ({ items = DEFAULT_FAQS, title = "Frequently Asked Questions" }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h3 style={{ color: "#00695c", fontWeight: 800, fontSize: "1.3rem", marginBottom: 12, textAlign: "center" }}>
        {title}
      </h3>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #00968811", padding: "0.5rem 1.2rem" }}>
        {items.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}

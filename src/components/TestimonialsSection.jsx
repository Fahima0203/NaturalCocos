// NOTE FOR SITE OWNER: The quotes below are generic PLACEHOLDER content only —
// they are NOT real customer testimonials. Fabricating specific named customer
// quotes would be misleading/deceptive (FTC-style fake review issue). Replace
// each entry with a genuine review (with the customer's permission) before
// launch, or remove this section entirely if you don't have real testimonials
// yet.

const PLACEHOLDER_TESTIMONIALS = [
  {
    quote: "Great quality cocopeat, consistent across every batch we've ordered.",
    author: "Bulk Buyer, Agriculture Sector",
  },
  {
    quote: "Packaging was solid and the shipment arrived on schedule.",
    author: "Export Client",
  },
  {
    quote: "Responsive team — quick replies to bulk pricing queries on WhatsApp.",
    author: "Wholesale Distributor",
  },
];

export default function TestimonialsSection({ items = PLACEHOLDER_TESTIMONIALS }) {
  return (
    <div style={{ background: "#fff", padding: "2.2rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", color: "#00695c", fontWeight: 800, fontSize: "1.3rem", marginBottom: 20 }}>
          What Our Customers Say
        </h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {items.map((t, i) => (
            <div key={i} style={{
              flex: "1 1 260px", maxWidth: 320,
              background: "#f5faf5", borderRadius: 12,
              padding: "1.4rem", border: "1px solid #e0f2f1",
            }}>
              <p style={{ color: "#444", fontSize: "0.92rem", fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>
                "{t.quote}"
              </p>
              <p style={{ color: "#00695c", fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>
                — {t.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

const BADGES = [
  { label: "🌿 Since 1998 · 40+ Years of Expertise", to: "/AboutUs" },
  { label: "✅ GST Registered", to: "/AboutUs#certifications" },
  { label: "✅ IEC Certified", to: "/AboutUs#certifications" },
  { label: "✅ MSME Registered", to: "/AboutUs#certifications" },
];

// Export-country flags strip is currently disabled (see commented-out render block below).
// const EXPORT_COUNTRIES = [
//   { flag: "🇸🇦", name: "Saudi Arabia" },
//   { flag: "🇦🇪", name: "UAE" },
//   { flag: "🇶🇦", name: "Qatar" },
//   { flag: "🇰🇼", name: "Kuwait" },
//   { flag: "🇴🇲", name: "Oman" },
//   { flag: "🇺🇸", name: "USA" },
//   { flag: "🇨🇦", name: "Canada" },
//   { flag: "🇩🇪", name: "Germany" },
//   { flag: "🇨🇳", name: "China" },
//   { flag: "🇯🇵", name: "Japan" },
//   { flag: "🇬🇧", name: "UK" },
//   { flag: "🇮🇷", name: "Iran" },
// ];

export default function TrustStrip() {
  return (
    <div style={{ background: "#f5faf5", padding: "1.6rem 1rem", borderTop: "1px solid #e0f2f1", borderBottom: "1px solid #e0f2f1" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 16 }}>
          {BADGES.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{
                background: "#fff", border: "1px solid #c8e6c9", borderRadius: 20,
                padding: "0.4rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "#00695c",
                textDecoration: "none", cursor: "pointer",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* <p style={{ color: "#666", fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>
          Proudly exporting to
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1rem", justifyContent: "center" }}>
          {EXPORT_COUNTRIES.map((c) => (
            <span key={c.name} title={c.name} style={{ fontSize: "0.85rem", color: "#444" }}>
              {c.flag} {c.name}
            </span>
          ))}
        </div> */}
      </div>
    </div>
  );
}

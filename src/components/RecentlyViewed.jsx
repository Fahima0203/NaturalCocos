import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productSections } from "../data/productSections";

const STORAGE_KEY = "nc_recently_viewed";
const MAX_ITEMS = 6;

// Reads/writes a small localStorage list of { section, name } — no backend needed.
export function recordRecentlyViewed(section, name) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = existing.filter(
      (it) => !(it.section === section && it.name === name)
    );
    filtered.unshift({ section, name });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage unavailable (private browsing, etc.) — silently skip
  }
}

export default function RecentlyViewed({ excludeSection, excludeName }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setItems(
        stored.filter((it) => !(it.section === excludeSection && it.name === excludeName))
      );
    } catch {
      setItems([]);
    }
  }, [excludeSection, excludeName]);

  if (items.length === 0) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h3 style={{ color: "#00695c", fontWeight: 800, fontSize: "1.15rem", marginBottom: 14 }}>
        Recently Viewed
      </h3>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {items.map((it) => {
          const sec  = productSections.find((s) => s.title === it.section);
          const prod = sec?.products?.find((p) => p.name === it.name);
          const img  = prod?.images?.[0];
          return (
            <button
              key={`${it.section}__${it.name}`}
              onClick={() => navigate(`/products/${encodeURIComponent(it.section)}/${encodeURIComponent(it.name)}`)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                width: 110, background: "#fff", border: "1px solid #e0f2f1",
                borderRadius: 10, padding: "0.6rem", cursor: "pointer",
              }}
            >
              <div style={{
                width: 70, height: 70, borderRadius: 8, overflow: "hidden",
                background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 6,
              }}>
                {img ? (
                  <img src={img} alt={it.name} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : <span style={{ fontSize: "1.4rem" }}>📦</span>}
              </div>
              <span style={{ fontSize: "0.78rem", color: "#333", fontWeight: 600, textAlign: "center" }}>
                {it.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

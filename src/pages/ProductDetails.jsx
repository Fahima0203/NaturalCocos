import { useParams, useNavigate, useLocation } from "react-router-dom";
import FooterContact from "../components/FooterContact";
import { productSections } from "../data/productSections";
import { productDetails } from "../data/productDetails";
// import { isCartEnabled } from "../data/cartConfig";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import QuantitySelector from "../components/QuantitySelector";
import RecentlyViewed, { recordRecentlyViewed } from "../components/RecentlyViewed";
import FAQ from "../components/FAQ";

const ProductDetails = () => {
    const { section: sectionParam, product: productParam } = useParams();

    // Find section and product (for images)
    const section = productSections.find(
        (s) => s.title.toLowerCase() === decodeURIComponent(sectionParam).toLowerCase()
    );
    const product = section
        ? section.products.find(
              (p) => p.name.toLowerCase() === decodeURIComponent(productParam).toLowerCase()
          )
        : null;

    // Find product details from JSON
    const detailsData = productDetails.find(
        (d) =>
            d.section.toLowerCase() === decodeURIComponent(sectionParam).toLowerCase() &&
            d.name.toLowerCase() === decodeURIComponent(productParam).toLowerCase()
    );

    const [mainImg, setMainImg] = useState(product?.images[0]);
    useEffect(() => {
        if (product?.images?.[0]) {
            setMainImg(product.images[0]);
        }
    }, [product]);

    const [zoom, setZoom] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

    // Collapsible state
    const [openSpec, setOpenSpec] = useState(true);
    const [openDesc, setOpenDesc] = useState(false);
    const [openBenefits, setOpenBenefits] = useState(false);
    const [openChipsBlocks, setOpenChipsBlocks] = useState(false);

    const thumbnailsRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Helper to scroll thumbnails
    const scrollThumbnails = (dir) => {
        const el = thumbnailsRef.current;
        if (!el) return;
        const scrollAmount = 80; // px per click
        if (dir === "left") {
            el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        } else {
            el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    // Check if arrows should be shown (thumbnails overflow)
    const updateArrows = () => {
        const el = thumbnailsRef.current;
        if (!el) return;
        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };

    // Attach scroll/resize listeners
    useEffect(() => {
        updateArrows();
        const el = thumbnailsRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, [product?.images?.length]);

    // ── Auth / Cart hooks (must be before any early return) ─────────────────
    const { currentUser } = useAuth();
    const { addToCart }   = useCart();
    const navigate        = useNavigate();
    const location        = useLocation();
    const [addedToCart, setAddedToCart] = useState(false);
    const [cartBusy, setCartBusy]       = useState(false);
    // true when user navigated here from the Home page FeaturedProducts section
    const fromHome = !!location.state?.fromHome;
    const [qty, setQty] = useState(1);
    // ────────────────────────────────────────────────────────────────────────

    // Track this product for the "Recently Viewed" strip (localStorage only)
    useEffect(() => {
        if (section?.title && product?.name) {
            recordRecentlyViewed(section.title, product.name);
        }
    }, [section?.title, product?.name]);

    if (!section || !product) {
        return <div style={{ padding: 40 }}>Product not found.</div>;
    }

    // Use details from JSON if available, else fallback
    const specification = detailsData?.specification || [];
    const description = detailsData?.description || ``;
    const benefits = detailsData?.benefits || [];
    const chipsBlocks = detailsData?.chips_blocks || null;
    // const brochure = detailsData?.brochure || "#";
    // const video = detailsData?.video || "#";

    // Example values, you can fetch from detailsData if available
    const price = detailsData?.price || "₹ 26/kg";
    const minOrder = detailsData?.minOrder || "5000 Kg";
    const whatsappNumber = "9445676371";
    const whatsappMsg = `Hi, I'm interested in ${product.name} (${section.title})`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;
    const quotationMsg = `Hi, I'd like a bulk quotation for ${product.name} (${section.title}). Please share pricing and MOQ details.`;
    const quotationLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(quotationMsg)}`;

    const coirYarnVariants = {
        "2 Ply 7 mm": [
            "2 Ply 7 mm (ONE Kg PCS)",
            "2 Ply 7 mm 22 Inches (HALF Kg PCS)",
            "2 Ply 7 mm 30 Inches (HALF Kg PCS)",
            "2 Ply 7 mm 15 inches (250g PCS)"
        ],
        "2 Ply 4 mm": [
            "2 Ply 4 mm 18 Inches 40 Feet (Per Kg 9 pcs)"
        ],
        "2 Ply 3 mm": [
            "2 Ply 3 mm 18 Inches 40 Feet (Per Kg 13 Pcs)"
        ],
        "2 Ply 5 mm": [
            "2 Ply 5 mm 48 Inches 40 Feet (Per Kg 7 pcs)",
            "2 Ply 5 mm 40 Inches",
            "2 Ply 5 mm Hand Made"
        ],
        "Double Piece": [
            "Double Piece 15 Feet",
            "Double Piece 18 Feet",
            "Double Piece 24 Feet"
        ]
    };

    // ── Add to Cart ──────────────────────────────────────────────────────────
    const handleAddToCart = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: location } });
            return;
        }
        setCartBusy(true);
        try {
            await addToCart(section.title, product.name, price, qty);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        } catch (err) {
            console.error('Add to cart failed:', err);
        }
        setCartBusy(false);
    };

    // ── Buy Now (home flow) ──────────────────────────────────────────────────
    const handleBuyNow = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: location } });
            return;
        }
        setCartBusy(true);
        try {
            await addToCart(section.title, product.name, price, qty);
            navigate('/checkout');
        } catch (err) {
            console.error('Buy now failed:', err);
            setCartBusy(false);
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    return (
        <>
            <div
                style={{
                    maxWidth: 1200,
                    margin: "2rem auto",
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(8,108,92,0.10)",
                    padding: 32,
                    display: "flex",
                    gap: 40,
                    flexDirection: "row",
                    alignItems: "flex-start"
                }}
                className="product-details-main"
            >
                {/* Left: Image gallery */}
                <div
                    style={{
                        minWidth: 320,
                        maxWidth: 420,
                        flex: "0 0 400px"
                    }}
                    className="product-details-gallery sticky-gallery"
                >
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: 340,
                            overflow: "hidden",
                            borderRadius: 14,
                            marginBottom: 18,
                            background: "#f7f7f7",
                            cursor: zoom ? "zoom-in" : "pointer",
                            boxShadow: "0 2px 12px rgba(8,108,92,0.07)"
                        }}
                        onMouseEnter={() => setZoom(true)}
                        onMouseLeave={() => setZoom(false)}
                        onMouseMove={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setZoomPos({
                                x: ((e.clientX - rect.left) / rect.width) * 100,
                                y: ((e.clientY - rect.top) / rect.height) * 100,
                            });
                        }}
                        onTouchStart={() => setZoom(false)}
                    >
                        <img
                            src={mainImg}
                            alt={product.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: 14,
                                transition: "transform 0.2s",
                                background: "#fff",
                                ...(zoom && window.innerWidth > 700
                                    ? {
                                        transform: `scale(2.1)`,
                                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                                    }
                                    : {})
                            }}
                        />
                        {/* Zoom lens effect for desktop */}
                        {zoom && window.innerWidth > 700 && (
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                border: "2px solid #00968844",
                                borderRadius: 14,
                                pointerEvents: "none"
                            }} />
                        )}
                    </div>
                    {/* Thumbnails with arrows and scroll */}
                    <div style={{ position: "relative", width: "100%" }}>
                        {/* Left Arrow */}
                        {showLeftArrow && (
                            <button
                                type="button"
                                aria-label="Scroll thumbnails left"
                                onClick={() => scrollThumbnails("left")}
                                style={{
                                    position: "absolute",
                                    left: -18,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 2,
                                    background: "#fff",
                                    border: "1.5px solid #009688",
                                    borderRadius: "50%",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 1px 6px rgba(8,108,92,0.10)",
                                    cursor: "pointer",
                                    opacity: 0.92,
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" fill="none" stroke="#009688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                        <div
                            className="product-thumbnails"
                            ref={thumbnailsRef}
                            style={{
                                display: "flex",
                                gap: 14,
                                marginBottom: 14,
                                overflowX: "auto",
                                scrollBehavior: "smooth",
                                padding: "2px 0",
                                scrollbarWidth: "none"
                            }}
                            tabIndex={0}
                        >
                            {product.images.map((img, idx) => (
                                <img
                                    key={img}
                                    src={img}
                                    loading="lazy" alt="premium quality cocopeat"
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 8,
                                        objectFit: "cover",
                                        border: mainImg === img ? "2.5px solid #009688" : "1.5px solid #eee",
                                        cursor: "pointer",
                                        background: "#fafafa",
                                        flex: "0 0 auto",
                                        boxShadow: mainImg === img ? "0 2px 8px #00968822" : "none",
                                        transition: "border 0.18s, box-shadow 0.18s"
                                    }}
                                    onClick={() => setMainImg(img)}
                                />
                            ))}
                        </div>
                        {/* Right Arrow */}
                        {showRightArrow && (
                            <button
                                type="button"
                                aria-label="Scroll thumbnails right"
                                onClick={() => scrollThumbnails("right")}
                                style={{
                                    position: "absolute",
                                    right: -18,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 2,
                                    background: "#fff",
                                    border: "1.5px solid #009688",
                                    borderRadius: "50%",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 1px 6px rgba(8,108,92,0.10)",
                                    cursor: "pointer",
                                    opacity: 0.92,
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <polyline points="9 6 15 12 9 18" fill="none" stroke="#009688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {/* Right: Info */}
                <div style={{
                    flex: 1,
                    padding: "0 0 0 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0
                }} className="product-details-info">
                    {/* Basic Info */}
                    <h2 style={{
                        fontWeight: 800,
                        fontSize: "2.1rem",
                        marginBottom: 8,
                        color: "#00695c",
                        letterSpacing: "0.5px"
                    }}>
                        {product.name} {section.title ? <span style={{fontWeight: 500, color: "#009688"}}>- {section.title}</span> : ""}
                    </h2>
                    {/* Price / purchase controls — layout depends on navigation source */}
                    {fromHome ? (
                        /* ── Home flow: actual price + qty selector + Add to Cart + Buy Now ── */
                        <>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#00695c", marginBottom: 6 }}>
                                {price}
                            </div>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                color: "#2e7d32", fontWeight: 700, fontSize: "0.85rem",
                                marginBottom: 10,
                            }}>
                                ✅ In Stock
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <span style={{ fontSize: "0.95rem", color: "#555", fontWeight: 600 }}>Qty:</span>
                                <QuantitySelector
                                    quantity={qty}
                                    onDecrease={() => setQty(q => Math.max(1, q - 1))}
                                    onIncrease={() => setQty(q => q + 1)}
                                    decreaseDisabled={qty <= 1}
                                    size="sm"
                                />
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartBusy}
                                    style={{
                                        background: addedToCart
                                            ? "linear-gradient(90deg, #388e3c 0%, #2e7d32 100%)"
                                            : "linear-gradient(90deg, #ff6f00 0%, #ffa000 100%)",
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: "1rem",
                                        border: "none",
                                        borderRadius: 9,
                                        padding: "0.75rem 1.5rem",
                                        cursor: cartBusy ? "not-allowed" : "pointer",
                                        opacity: cartBusy ? 0.75 : 1,
                                        transition: "background 0.25s",
                                    }}
                                >
                                    {addedToCart ? "✓ Added!" : cartBusy ? "Adding…" : "🛒 Add to Cart"}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={cartBusy}
                                    style={{
                                        background: "linear-gradient(90deg, #00695c 0%, #43a047 100%)",
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: "1rem",
                                        border: "none",
                                        borderRadius: 9,
                                        padding: "0.75rem 1.5rem",
                                        cursor: cartBusy ? "not-allowed" : "pointer",
                                        opacity: cartBusy ? 0.75 : 1,
                                        transition: "opacity 0.2s",
                                    }}
                                >
                                    {cartBusy ? "Please wait…" : "⚡ Buy Now"}
                                </button>
                            </div>
                            <a
                                href={quotationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#00695c", fontWeight: 600, fontSize: "0.88rem",
                                    textDecoration: "underline", display: "inline-block", marginBottom: 18,
                                    cursor: "pointer",
                                }}
                            >
                                Need bulk pricing? Request a Quotation →
                            </a>
                        </>
                    ) : (
                        /* ── Default flow: Get Latest Price button + MOQ ── */
                        <>
                            <div style={{
                                fontSize: "1.22rem",
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 18
                            }}>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#fff",
                                        background: "#009688",
                                        fontWeight: 700,
                                        fontSize: "1.09rem",
                                        textDecoration: "none",
                                        borderRadius: 6,
                                        padding: "6px 18px",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 8px #00968822",
                                        transition: "background 0.18s"
                                    }}
                                >
                                    Get Latest Price
                                </a>
                            </div>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                color: "#2e7d32", fontWeight: 700, fontSize: "0.85rem",
                                marginBottom: 10,
                            }}>
                                ✅ In Stock
                            </div>
                            <div style={{
                                fontSize: "1.09rem",
                                color: "#222",
                                marginBottom: 10,
                                fontWeight: 500
                            }}>
                                <span style={{ fontWeight: 600 }}>Minimum Order Quantity:</span>{" "}
                                <span style={{ fontWeight: 700, color: "#009688" }}>{minOrder}</span>
                            </div>
                        </>
                    )}
                    {/* <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
                        <a href={brochure} target="_blank" rel="noopener noreferrer" style={{ border: "none", background: "#e0f2f1", color: "#1976d2", fontWeight: 600, borderRadius: 6, padding: "5px 14px", textDecoration: "none", cursor: "pointer" }}>Product Brochure</a>
                        <a href={video} target="_blank" rel="noopener noreferrer" style={{ border: "none", background: "#e0f2f1", color: "#1976d2", fontWeight: 600, borderRadius: 6, padding: "5px 14px", textDecoration: "none", cursor: "pointer" }}>Watch Video</a>
                    </div> */}
                    {/* --- Show sub-variants for Coir Yarn --- */}
                    {section.title === "Coir Yarn" && coirYarnVariants[product.name] && (
                        <div style={{
                            margin: "18px 0 18px 0",
                            padding: "18px 18px 12px 18px",
                            background: "linear-gradient(90deg, #e0f2f1 0%, #f1f8e9 100%)",
                            borderRadius: 12,
                            boxShadow: "0 2px 8px rgba(8,108,92,0.07)"
                        }}>
                            <div style={{ fontWeight: 700, color: "#00695c", marginBottom: 8, fontSize: "1.18rem" }}>
                                Available Variants:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 22, fontSize: "1.13rem", color: "#234" }}>
                                {coirYarnVariants[product.name].map((variant, idx) => (
                                    <li key={idx} style={{ marginBottom: 6 }}>{variant}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Collapsible Specification */}
                    {specification.length > 0 && (
                        <div className="collapsible-section">
                            <button
                                onClick={() => setOpenSpec((v) => !v)}
                                className="collapsible-header"
                                aria-expanded={openSpec}
                            >
                                <span>Specification</span>
                                <span
                                    className="chevron"
                                    style={{
                                        transform: openSpec ? "rotate(180deg)" : "rotate(0deg)"
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" style={{ display: "block" }}>
                                        <polyline points="6 9 12 15 18 9" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </button>
                            {openSpec && (
                                <div className="collapsible-content">
                                    <table style={{ width: "100%", borderCollapse: "collapse", margin: "0 0 16px 0", fontSize: "1.08rem" }}>
                                        <tbody>
                                            {specification.map((row) => (
                                                <tr key={row.label}>
                                                    <td style={{ border: "1px solid #eee", padding: "7px 14px", fontWeight: 600, background: "#e0f2f1", width: 200 }}>{row.label}</td>
                                                    <td style={{ border: "1px solid #eee", padding: "7px 14px" }}>{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Collapsible Description */}
                    {description && description.trim() && (
                        <div className="collapsible-section">
                            <button
                                onClick={() => setOpenDesc((v) => !v)}
                                className="collapsible-header"
                                aria-expanded={openDesc}
                            >
                                <span>Description</span>
                                <span
                                    className="chevron"
                                    style={{
                                        transform: openDesc ? "rotate(180deg)" : "rotate(0deg)"
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" style={{ display: "block" }}>
                                        <polyline points="6 9 12 15 18 9" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </button>
                            {openDesc && (
                                <div className="collapsible-content">
                                    <div style={{ fontSize: "1.09rem", color: "#333", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                            )}
                        </div>
                    )}
                    {/* Collapsible Chips Blocks — hidden in home flow */}
                    {!fromHome && chipsBlocks && (chipsBlocks.text || (chipsBlocks.table && chipsBlocks.table.length > 0)) && (
                        <div className="collapsible-section">
                            <button
                                onClick={() => setOpenChipsBlocks((v) => !v)}
                                className="collapsible-header"
                                aria-expanded={openChipsBlocks}
                            >
                                <span>Coco Husk Chips Blocks</span>
                                <span
                                    className="chevron"
                                    style={{
                                        transform: openChipsBlocks ? "rotate(180deg)" : "rotate(0deg)"
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" style={{ display: "block" }}>
                                        <polyline points="6 9 12 15 18 9" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </button>
                            {openChipsBlocks && (
                                <div className="collapsible-content">
                                    {chipsBlocks.text && (
                                        <div style={{ marginBottom: 18, fontSize: "1.07rem" }} dangerouslySetInnerHTML={{ __html: chipsBlocks.text }} />
                                    )}
                                    {chipsBlocks.table && chipsBlocks.table.length > 0 && (
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ minWidth: 600, fontSize: "1.07rem" }}>
                                                <thead>
                                                    <tr style={{ background: "rgb(8, 108, 92)" }}>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Product Code</th>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Product Name</th>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Block Size(cm) (±5%)</th>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Particle Size(mm) (±5%)</th>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Mixture</th>
                                                        <th style={{ color: "#fff", padding: "10px 8px", border: "1px solid #388e3c" }}>Approx Expansion Volume</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chipsBlocks.table.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px"}}>{row.product_code}</td>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px", color: "#888", fontWeight: 600 }}>{row.product_name}</td>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px"}}>{row.size}</td>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px"}}>{row.particle_size}</td>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px"}}>{row.mixture}</td>
                                                            <td style={{ border: "1px solid #e0e0e0", padding: "10px 8px"}}>{row.expansion_volume}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Collapsible Benefits */}
                    {benefits && Array.isArray(benefits) && benefits.length > 0 && (
                        <div className="collapsible-section">
                            <button
                                onClick={() => setOpenBenefits((v) => !v)}
                                className="collapsible-header"
                                aria-expanded={openBenefits}
                            >
                                <span>Benefits</span>
                                <span
                                    className="chevron"
                                    style={{
                                        transform: openBenefits ? "rotate(180deg)" : "rotate(0deg)"
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" style={{ display: "block" }}>
                                        <polyline points="6 9 12 15 18 9" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </button>
                            {openBenefits && (
                                <div className="collapsible-content">
                                    <ul style={{ margin: 0, paddingLeft: 22, fontSize: "1.09rem" }}>
                                        {benefits.map((b, i) => (
                                            <li key={i} style={{ marginBottom: 6 }}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Interested / action bar — hidden in home flow (controls shown at top) */}
                    {!fromHome && (
                    <>
                    <div style={{
                        marginTop: 22,
                        fontSize: "1.13rem",
                        background: "#e0f2f1",
                        borderRadius: 8,
                        padding: "12px 18px",
                        color: "#00695c",
                        fontWeight: 600,
                        boxShadow: "0 1px 6px #00968811"
                    }}>
                        Interested in this product?{" "}
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#009688",
                                fontWeight: 700,
                                textDecoration: "underline",
                                marginLeft: 2,
                                cursor: "pointer",
                            }}
                        >
                            Get Best Quote
                        </a>
                    </div>
                    {/* Yes, I am interested button */}
                    <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
                        {/* Add to Cart — only enabled for products listed in src/data/cartConfig.js
                            To enable for more products, add their { section, name } to CART_ENABLED_PRODUCTS */}
                        {/* {isCartEnabled(section.title, product.name) && (
                        <button
                            onClick={handleAddToCart}
                            disabled={cartBusy}
                            style={{
                                background: addedToCart
                                    ? "linear-gradient(90deg, #388e3c 0%, #2e7d32 100%)"
                                    : "linear-gradient(90deg, #ff6f00 0%, #ffa000 100%)",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                border: "none",
                                borderRadius: 9,
                                padding: "1.05rem 2rem",
                                boxShadow: "0 2px 12px rgba(255,111,0,0.18)",
                                cursor: cartBusy ? "not-allowed" : "pointer",
                                opacity: cartBusy ? 0.75 : 1,
                                transition: "background 0.25s",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                            className="yes-interested-btn"
                        >
                            {addedToCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
                        </button>
                        )} */}
                        {/* WhatsApp CTA */}
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                background: "linear-gradient(90deg, #009688 0%, #43a047 100%)",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "1.18rem",
                                border: "none",
                                borderRadius: 9,
                                padding: "1.05rem 2.5rem",
                                boxShadow: "0 2px 12px rgba(0,150,136,0.13)",
                                cursor: "pointer",
                                textDecoration: "none",
                                transition: "background 0.18s"
                            }}
                            className="yes-interested-btn"
                        >
                            Yes, I am interested!
                        </a>
                    </div>
                    </>
                    )}
                </div>
            </div>
            <RecentlyViewed excludeSection={section.title} excludeName={product.name} />
            <FAQ />
            <FooterContact />
            <style>
                {`
                @media (max-width: 1100px) {
                    .product-details-main {
                        flex-direction: column !important;
                        padding: 16px !important;
                        gap: 22px !important;
                        max-width: 99vw !important;
                    }
                    .product-details-gallery {
                        min-width: 0 !important;
                        max-width: 100% !important;
                        flex: none !important;
                        z-index: unset !important;
                    }
                    .sticky-gallery {
                        position: static !important;
                    }
                    .product-details-gallery > div:first-child {
                        height: 400px !important;
                        margin-bottom: 0px !important;
                        display: flex !important;
                    }
                    .product-details-gallery img {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    .product-thumbnails {
                        gap: 8px !important;
                        margin-bottom: 10px !important;
                        overflow-x: auto !important;
                        padding-bottom: 4px;
                    }
                    .product-thumbnails img {
                        width: 48px !important;
                        height: 48px !important;
                    }
                    .product-details-info {
                        padding: 0 !important;
                    }
                    .product-details-info h2 {
                        font-size: 1.25rem !important;
                    }
                    .product-details-info table {
                        font-size: 0.98rem !important;
                    }
                    .product-details-info button,
                    .product-details-gallery button {
                        font-size: 1rem !important;
                        margin-top: 10px !important;
                        padding: 0.7rem 0 !important;
                    }
                    .yes-interested-btn {
                        width: 100% !important;
                        font-size: 1.05rem !important;
                        padding: 0.8rem 0 !important;
                        text-align: center !important;
                    }
                }
                @media (max-width: 700px) {
                    .product-details-main {
                        flex-direction: column !important;
                        padding: 8px !important;
                        gap: 12px !important;
                        max-width: 100vw !important;
                    }
                    .product-details-gallery > div:first-child {
                        height: 300px !important;
                        margin-bottom: 0px !important;
                        display: flex !important;
                    }
                    .product-thumbnails img {
                        width: 38px !important;
                        height: 38px !important;
                    }
                    .product-details-info h2 {
                        font-size: 1.07rem !important;
                    }
                    .yes-interested-btn {
                        font-size: 0.98rem !important;
                        padding: 0.7rem 0 !important;
                        text-align: center !important;
                    }
                }
                .collapsible-section {
                    border-top: 1.5px solid #e0e0e0;
                    margin-top: 18px;
                    margin-bottom: 0;
                }
                .collapsible-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: none;
                    border: none;
                    font-size: 1.22rem;
                    font-weight: 700;
                    color: #181818;
                    padding: 18px 0 12px 0;
                    margin: 0;
                    cursor: pointer;
                    transition: background 0.18s, box-shadow 0.18s, color 0.18s;
                    border-radius: 10px;
                    outline: none;
                    position: relative;
                    z-index: 1;
                }
                .collapsible-header:hover, .collapsible-header:focus {
                    background: linear-gradient(90deg, #e0f7fa 0%, #e8f5e9 100%);
                    color: #009688;
                    box-shadow: 0 2px 12px #00968822;
                }
                .collapsible-header:active {
                    background: linear-gradient(90deg, #b2dfdb 0%, #c8e6c9 100%);
                    color: #00695c;
                }
                .collapsible-header .chevron svg {
                    transition: transform 0.2s, stroke 0.18s;
                    stroke: #009688;
                }
                .collapsible-header:hover .chevron svg,
                .collapsible-header:focus .chevron svg {
                    stroke: #00695c;
                }
                .collapsible-content {
                    padding-left: 2px;
                    padding-bottom: 12px;
                }
                /* Sticky gallery for desktop */
                @media (min-width: 701px) {
                    .sticky-gallery {
                        align-self: flex-start;
                        position: sticky;
                        top: 32px;
                    }
                }
                .yes-interested-btn:hover, .yes-interested-btn:focus {
                    background: #00796b !important;
                    color: #fff !important;
                }
                .product-thumbnails::-webkit-scrollbar {
                    display: none;
                }
                `}
            </style>
        </>
    );
};

export default ProductDetails;

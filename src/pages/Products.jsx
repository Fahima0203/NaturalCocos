import FooterContact from "../components/FooterContact";
import { useState } from "react";
import { RunningBadge } from "../pages/About";
import ProductSidebar from "../components/ProductSidebar";
import { useNavigate } from "react-router-dom";
import { productSections } from "../data/productSections";

const pageDescription =
    "Explore our premium range of eco-friendly agricultural products such as Coco products and Organic Fertilizers. Use the search box to quickly find products by name, description, or category. 🌿 Whether you're a home gardener, commercial farmer, or bulk buyer, we offer reliable, sustainable solutions to meet your growing needs. Discover best sellers, natural inputs, and innovative products designed for healthy plants and better yields.";

const Products = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // Filter logic: match in section title, section description, or product name
    const filteredSections = productSections
        .map((section) => {
            // Check if section matches search
            const sectionMatch =
                section.title.toLowerCase().includes(search.toLowerCase()) ||
                section.description.toLowerCase().includes(search.toLowerCase());

            // Filter products in section
            const filteredProducts = section.products.filter((prod) =>
                prod.name.toLowerCase().includes(search.toLowerCase())
            );

            // If section matches, show all products; else, only filtered products
            if (sectionMatch) {
                return { ...section, products: section.products };
            } else if (filteredProducts.length > 0) {
                return { ...section, products: filteredProducts };
            } else {
                return null;
            }
        })
        .filter(Boolean);

    const handleViewMore = (section) => {
        // Go to first product in section
        if (section.products && section.products.length > 0) {
            const prod = section.products[0];
            navigate(`/products/${encodeURIComponent(section.title)}/${encodeURIComponent(prod.name)}`);
        }
    };

    const handleProductClick = (section, prod) => {
        navigate(`/products/${encodeURIComponent(section.title)}/${encodeURIComponent(prod.name)}`);
    };

    return (
        <>
            <RunningBadge />
            <div style={styles.page}>
                <div
                    className="products-page-description"
                    style={{
                        margin: "0 2rem 1.5rem 2rem",
                        color: "#555",
                        fontSize: "1.13rem",
                        background: "linear-gradient(90deg, #e0f2f1 0%, #f1f8e9 100%)",
                        borderRadius: 12,
                        padding: "1.1rem 1.5rem",
                        boxShadow: "0 2px 8px #00968811",
                        fontWeight: 500,
                        lineHeight: 1.7,
                        letterSpacing: "0.01em"
                    }}
                >
                    {pageDescription}
                </div>
                <div style={styles.mainRow}>
                    {/* Sidebar left */}
                    <div style={styles.sidebarCol} className="product-sidebar-col">
                        <ProductSidebar productSections={filteredSections} />
                    </div>
                    {/* Right: search above product content */}
                    <div style={styles.rightCol}>
                        <div style={styles.searchBoxWrap}>
                            <div className="search-bar-enhanced" style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                background: "#fff",
                                borderRadius: "12px",
                                border: "2px solid #b2dfdb",
                                padding: "0.2rem 1rem",
                                maxWidth: 500,
                            }}>
                                <svg width="22" height="22" fill="none" stroke="#009688" strokeWidth="2" style={{marginRight: 8}}>
                                    <circle cx="10" cy="10" r="8" />
                                    <line x1="16" y1="16" x2="21" y2="21" />
                                </svg>
                                <input
                                    id="product-search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by product, section, or keyword..."
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        // background: "transparent",
                                        fontSize: "1.09rem",
                                        // color: "#333",
                                        width: "100%",
                                        padding: "0.4rem 0",
                                        // fontWeight: 500,
                                        // letterSpacing: "0.01em"
                                    }}
                                />
                                {search && (
                                    <button
                                        aria-label="Clear search"
                                        onClick={() => setSearch("")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#bbb",
                                            fontSize: "1.2rem"
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={styles.productsContent} className="products-content">
                            {filteredSections.length === 0 ? (
                                <div style={{ color: "#b00", fontSize: "1.1rem", margin: "2rem" }}>
                                    No products found matching your search.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop/tablet view: show by category */}
                                    <div className="desktop-products-list">
                                        {filteredSections.map((section, idx) => {
                                            const sectionId = section.title
                                                ? section.title.toLowerCase().replace(/\s+/g, "-")
                                                : `section-${idx}`;
                                            return (
                                                <div key={section.title} id={sectionId} style={styles.section} >
                                                    <div style={styles.sectionHeader} className="sectionHeader">
                                                        <h2 style={styles.sectionTitle} className="sectionTitle">{section.title}</h2>
                                                        <button
                                                            style={styles.viewMoreBtn}
                                                            className="viewMoreBtn"
                                                            onClick={() => handleViewMore(section)}
                                                        >
                                                            View More
                                                        </button>
                                                    </div>
                                                    <p style={styles.sectionDesc} className="sectionDesc">{section.description}</p>
                                                    <div style={styles.cardGridHorizontal} className="cardGridHorizontal">
                                                        {section.products.map((prod, pidx) => {
                                                            const prodId = prod.name
                                                                ? prod.name.toLowerCase().replace(/\s+/g, "-")
                                                                : `product-${pidx}`;
                                                            return (
                                                                <div
                                                                    key={prod.name}
                                                                    id={prodId}
                                                                    style={{
                                                                        ...styles.card,
                                                                        background: "#f8f8fa",
                                                                        border: "1.5px solid #e0f2f1",
                                                                        boxShadow: "0 2px 12px rgba(8,108,92,0.07)",
                                                                        transition: "box-shadow 0.22s, transform 0.22s, border 0.22s",
                                                                        cursor: "pointer",
                                                                        position: "relative"
                                                                    }}
                                                                    className="product-card"
                                                                    onClick={() => handleProductClick(section, prod)}
                                                                    tabIndex={0}
                                                                    role="button"
                                                                >
                                                                    <img
                                                                        src={prod.images[0]}
                                                                        alt={prod.name}
                                                                        loading="lazy"
                                                                        style={{
                                                                            ...styles.cardImg,
                                                                            border: "2px solid #b2dfdb",
                                                                            boxShadow: "0 2px 8px #00968811"
                                                                        }}
                                                                        className="product-card-img"
                                                                    />
                                                                    <div style={{
                                                                        ...styles.cardLabel,
                                                                        fontWeight: 700,
                                                                        color: "#00695c",
                                                                        fontSize: "1.09rem",
                                                                        marginBottom: 4
                                                                    }}>
                                                                        {prod.name}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: "0.95rem",
                                                                        color: "#1976d2",
                                                                        fontWeight: 500,
                                                                        marginBottom: 2
                                                                    }}>
                                                                        {section.title}
                                                                    </div>
                                                                    <span style={{
                                                                        position: "absolute",
                                                                        top: 10,
                                                                        right: 10,
                                                                        background: "linear-gradient(90deg,#e0f2f1 0%,#f1f8e9 100%)",
                                                                        color: "#43a047",
                                                                        fontWeight: 700,
                                                                        fontSize: "0.85rem",
                                                                        borderRadius: 6,
                                                                        padding: "2px 10px"
                                                                    }}>
                                                                        {pidx === 0 ? "Best Seller" : ""}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Mobile view: show one by one */}
                                    <div className="all-products-mobile-list">
                                        {filteredSections.flatMap((section, idx) => {
                                            return section.products.map((prod, pidx) => {
                                                const prodId = prod.name
                                                    ? prod.name.toLowerCase().replace(/\s+/g, "-")
                                                    : `product-${pidx}`;
                                                return (
                                                    <div
                                                        key={section.title + prod.name}
                                                        id={prodId}
                                                        className="product-card-mobile"
                                                        style={{
                                                            ...styles.cardMobile,
                                                            border: "1.5px solid #e0f2f1",
                                                            boxShadow: "0 2px 8px #00968811"
                                                        }}
                                                        onClick={() => handleProductClick(section, prod)}
                                                        tabIndex={0}
                                                        role="button"
                                                    >
                                                        <img
                                                            src={prod.images[0]}
                                                            alt={prod.name}
                                                            loading="lazy"
                                                            style={{
                                                                ...styles.cardImgMobile,
                                                                border: "2px solid #b2dfdb"
                                                            }}
                                                        />
                                                        <div style={{
                                                            ...styles.cardLabelMobile,
                                                            fontWeight: 700,
                                                            color: "#00695c"
                                                        }}>{prod.name}</div>
                                                        <div style={{
                                                            ...styles.sectionLabelMobile,
                                                            color: "#1976d2"
                                                        }}>{section.title}</div>
                                                        <span style={{
                                                            position: "absolute",
                                                            top: 10,
                                                            right: 10,
                                                            background: "linear-gradient(90deg,#e0f2f1 0%,#f1f8e9 100%)",
                                                            color: "#43a047",
                                                            fontWeight: 700,
                                                            fontSize: "0.85rem",
                                                            borderRadius: 6,
                                                            padding: "2px 10px"
                                                        }}>
                                                            {pidx === 0 ? "Best Seller" : ""}
                                                        </span>
                                                    </div>
                                                );
                                            });
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <FooterContact />
            <style>
                {`
                @media (min-width: 701px) {
                    .desktop-products-list { display: block !important; }
                    .all-products-mobile-list, .product-card-mobile { display: none !important; }
                    .product-sidebar-col {
                        position: sticky;
                        top: 32px;
                        z-index: 2;
                        align-self: flex-start;
                    }
                    .product-card:hover, .product-card:focus {
                        background: linear-gradient(90deg, #e0f7fa 0%, #e8f5e9 100%) !important;
                        border: 2px solid #009688 !important;
                        box-shadow: 0 6px 24px #00968822 !important;
                        transform: translateY(-6px) scale(1.045);
                    }
                    .product-card:hover .product-card-img,
                    .product-card:focus .product-card-img {
                        border: 2.5px solid #009688 !important;
                        box-shadow: 0 4px 16px #00968833 !important;
                    }
                    .viewMoreBtn:hover, .viewMoreBtn:focus {
                        background: linear-gradient(90deg, #009688 0%, #43a047 100%) !important;
                        color: #fff !important;
                        border: 1.5px solid #43a047 !important;
                        transform: translateY(-2px) scale(1.04);           
                    }
                }
                @media (max-width: 700px) {
                    .desktop-products-list { display: none !important; }
                    .all-products-mobile-list {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 1.2rem !important;
                        width: 100%;
                    }
                    .product-card-mobile {
                        background: #fff;
                        border-radius: 12px;
                        box-shadow: 0 2px 8px #00968811;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 1.2rem;
                        width: 100%;
                        max-width: 350px;
                        margin: 0 auto;
                        position: relative;
                        border: 1.5px solid #e0f2f1;
                        transition: box-shadow 0.22s, border 0.22s;
                    }
                    .product-card-mobile:active {
                        border: 2px solid #009688;
                        box-shadow: 0 4px 16px #00968833;
                    }
                    .product-card-mobile img {
                        width: 100%;
                        max-width: 180px;
                        height: 120px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-bottom: 0.8rem;
                        background: #eaeaea;
                        border: 2px solid #b2dfdb;
                        transition: border 0.18s, box-shadow 0.18s;
                    }
                    .product-card-mobile .product-label-mobile {
                        font-size: 1rem;
                        color: #222;
                        text-align: center;
                        margin-top: 0.5rem;
                    }
                    .product-card-mobile .section-label-mobile {
                        font-size: 0.9rem;
                        color: #2d2d8c;
                        margin-top: 0.3rem;
                        font-weight: 500;
                    }
                    .product-sidebar-col {
                        display: none !important;
                    }
                    .products-page-description {
                        font-size: 0.97rem !important;
                        padding: 0.6rem 0.7rem !important;
                        margin: 0 0.5rem 1.2rem 0.5rem !important;
                    }
                    .search-bar-enhanced {
                        padding: 0.07rem 0.5rem !important;
                        max-width: 100% !important;
                    }
                    .search-bar-enhanced input {
                        font-size: 0.93rem !important;
                        padding: 0.22rem 0 !important;
                    }
                }
                @media (max-width: 430px) {
                    .products-page-description {
                        font-size: 0.92rem !important;
                        padding: 0.45rem 0.4rem !important;
                        margin: 0 0.2rem 1rem 0.2rem !important;
                    }
                    .search-bar-enhanced {
                        padding: 0.04rem 0.3rem !important;
                    }
                    .search-bar-enhanced input {
                        font-size: 0.89rem !important;
                    }
                }
                `}
            </style>
        </>
    );
};

const styles = {
    page: {
        background: "#fafbfc",
        minHeight: "100vh",
        padding: "1rem 0",
    },
    pageTitle: {
        fontSize: "2rem",
        fontWeight: "bold",
        margin: "1rem 2rem",
    },
    mainRow: {
        display: "flex",
        flexDirection: "row",
        maxWidth: "1200px",
        gap: "2rem",
        alignItems: "flex-start",
        width: "100%",
        padding: "0 1rem",
    },
    sidebarCol: {
        minWidth: 260,
        maxWidth: 340,
        width: "25%",
    },
    rightCol: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    searchBoxWrap: {
        width: "100%",
        marginBottom: "0.5rem",
        display: "flex",
        justifyContent: "flex-start",
    },
    simpleSearchBox: {
        width: "100%",
        maxWidth: 900,
        padding: "0.5rem",
        borderRadius: "9px",
        border: "2px solid #9797b7",
        outline: "none",
        background: "#fff",
        color: "#444",
        boxShadow: "none",
        fontWeight: 400,
        transition: "border 0.2s",
    },
    productsContent: {
        flex: 1,
        paddingLeft: 0,
    },
    section: {
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        marginBottom: "2rem",
        maxWidth: "1100px",
        padding: "2rem",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.5rem",
    },
    sectionTitle: {
        color: "#2d2d8c",
        fontWeight: "bold",
        fontSize: "1.3rem",
        margin: 0,
    },
    viewMoreBtn: {
        border: "1px solid #2d2d8c",
        background: "#fff",
        color: "#2d2d8c",
        borderRadius: "4px",
        padding: "0.4rem 1rem",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "0.95rem",
    },
    sectionDesc: {
        color: "#444",
        marginBottom: "1.5rem",
        fontSize: "1rem",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1.5rem",
    },
    cardGridHorizontal: {
        display: "flex",
        flexDirection: "row",
        gap: "1.5rem",
        overflowX: "auto",
        paddingBottom: "1rem",
        scrollbarWidth: "thin",
        scrollbarColor: "#bbb #f8f8fa",
        minWidth: 0,
    },
    card: {
        background: "#f8f8fa",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        transition: "box-shadow 0.2s",
        minWidth: 180,
        maxWidth: 220,
        flex: "0 0 auto",
    },
    cardImg: {
        width: "100%",
        maxWidth: "160px",
        height: "140px",
        objectFit: "cover",
        borderRadius: "6px",
        marginBottom: "0.8rem",
        background: "#eaeaea",
    },
    cardLabel: {
        fontSize: "1rem",
        color: "#222",
        textAlign: "center",
        marginTop: "0.5rem",
    },
    // Mobile styles for product cards
    cardMobile: {
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        width: "100%",
        maxWidth: 350,
        margin: "0 auto",
    },
    cardImgMobile: {
        width: "100%",
        maxWidth: "180px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "6px",
        marginBottom: "0.8rem",
        background: "#eaeaea",
    },
    cardLabelMobile: {
        fontSize: "1rem",
        color: "#222",
        textAlign: "center",
        marginTop: "0.5rem",
    },
    sectionLabelMobile: {
        fontSize: "0.9rem",
        color: "#2d2d8c",
        marginTop: "0.3rem",
        fontWeight: 500,
    },
};

export default Products;
import { useState, useRef, useMemo, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'https://koopje-production-b49f.up.railway.app/api';

console.log('🔧 API URL:', API_URL);

/* ────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────── */

function getProductData(products, productId) {
  return products[productId] || { retailers: [], nextDiscount: "" };
}

function getCheapestRetailer(products, productId) {
  const product = products[productId];
  if (!product || !product.retailers || product.retailers.length === 0) return null;
  return product.retailers.reduce((a, b) => (a.price < b.price ? a : b));
}

/* ────────────────────────────────────────────────────────
   SHARED COMPONENTS
──────────────────────────────────────────────────────── */

function BottomNav({ active, onNavigate }) {
  const tabs = [
    { id: "wishlist", icon: HeartIcon, label: "Wensenlijst" },
    { id: "compare", icon: CompareIcon, label: "Vergelijk" },
    { id: "alerts", icon: BellIcon, label: "Meldingen" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "2px solid #e8e2d9",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0 env(safe-area-inset-bottom, 12px)",
        zIndex: 100,
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onNavigate(t.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: active === t.id ? "#1a6b5a" : "#9e9689",
            padding: "8px 12px",
            minWidth: 70,
          }}
        >
          <t.icon active={active === t.id} />
          <span
            style={{
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: active === t.id ? 700 : 500,
            }}
          >
            {t.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

function StatusBar() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 20px 6px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        color: "#3d3832",
      }}
    >
      <span>{hours}:{minutes}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span>📶</span>
        <span>📡</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "20px 20px 12px" }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1c1917",
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: "#8a8279",
            margin: "6px 0 0",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
          width: "100%",
          maxWidth: 430,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ICONS
──────────────────────────────────────────────────────── */

function HeartIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#1a6b5a" : "none"} stroke={active ? "#1a6b5a" : "#9e9689"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CompareIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a6b5a" : "#9e9689"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function BellIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#1a6b5a" : "none"} stroke={active ? "#1a6b5a" : "#9e9689"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        border: "none",
        cursor: "pointer",
        background: on ? "#1a6b5a" : "#d4cfc7",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 3,
          left: on ? 25 : 3,
          transition: "left 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    </button>
  );
}

/* ────────────────────────────────────────────────────────
   WISHLIST SCREEN
──────────────────────────────────────────────────────── */

function WishlistScreen({
  products,
  wishlistIds,
  toggleWishlist,
  setSelectedProductId,
  onNavigate,
  productAlerts,
  toggleProductAlert,
  lastUpdated,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const productList = Object.entries(products).map(([id, product]) => ({
    id,
    ...product,
  }));

  const filteredProducts = useMemo(() => {
    return productList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, productList]);

  const wishlistProducts = productList.filter((p) => wishlistIds.includes(p.id));

  const handleViewRetailers = (e, productId) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    onNavigate("compare");
  };
  
  // Format last updated date
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('nl-NL', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <StatusBar />
      <PageHeader
        title="Wensenlijst"
        subtitle="Sla producten op en zie meteen waar je het beste kunt kopen."
      />
      
      {lastUpdated && (
        <div style={{
          margin: "0 20px 12px",
          padding: "10px 14px",
          background: "#f0faf7",
          borderRadius: 12,
          border: "1px solid #c8ece2",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>🕐</span>
          <span style={{
            fontSize: 12,
            color: "#1a6b5a",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}>
            Laatst bijgewerkt: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      )}

      <div style={{ padding: "0 20px 18px" }}>
        <input
          type="text"
          placeholder="Zoek luiers, doekjes, voeding..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px 16px",
            borderRadius: 14,
            border: "1px solid #e8e2d9",
            background: "white",
            fontSize: 14,
            color: "#1c1917",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
          }}
        />

        {searchQuery && (
          <div
            style={{
              marginTop: 10,
              background: "white",
              border: "1px solid #ebe6de",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  padding: "18px 16px",
                  color: "#8a8279",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                }}
              >
                Geen producten gevonden
              </div>
            ) : (
              filteredProducts.map((product) => {
                const cheapest = getCheapestRetailer(products, product.id);
                const isSaved = wishlistIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #f3eee7",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{product.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1c1917",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {product.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#8a8279",
                          fontFamily: "'DM Sans', sans-serif",
                          marginTop: 2,
                        }}
                      >
                        {cheapest ? `Vanaf €${cheapest.price.toFixed(2)} bij ${cheapest.name}` : 'Geen prijzen'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      style={{
                        background: isSaved ? "#1a6b5a" : "#f5f1eb",
                        color: isSaved ? "white" : "#1c1917",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        minWidth: 44,
                      }}
                    >
                      {isSaved ? "✓" : "+"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "0 20px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#1c1917",
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Mijn producten
        </h2>
        <span
          style={{
            fontSize: 12,
            color: "#8a8279",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {wishlistProducts.length} producten
        </span>
      </div>

      <div style={{ padding: "0 20px" }}>
        {wishlistProducts.length === 0 ? (
          <div
            style={{
              background: "#f8f5f0",
              borderRadius: 16,
              padding: "28px 18px",
              textAlign: "center",
              border: "1px solid #ebe6de",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>🛒</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1c1917",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 6,
              }}
            >
              Nog geen producten opgeslagen
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#8a8279",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
              }}
            >
              Zoek hierboven op producten die je vaker koopt.
            </div>
          </div>
        ) : (
          wishlistProducts.map((product) => {
            const cheapest = getCheapestRetailer(products, product.id);
            const retailers = product.retailers || [];
            const hasAlert = !!productAlerts[product.id];

            // Calculate discount percentage
            const normalPrice = retailers.length > 0 
              ? retailers.reduce((sum, r) => sum + r.price, 0) / retailers.length 
              : 0;
            const discountPercentage = normalPrice > 0 && cheapest
              ? Math.round(((normalPrice - cheapest.price) / normalPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: 18,
                  border: "1px solid #ebe6de",
                  padding: "16px",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#f8f5f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {product.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1c1917",
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.35,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#8a8279",
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 3,
                      }}
                    >
                      {product.category} · {product.size}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c4564a",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {cheapest && (
                  <div
                    style={{
                      marginTop: 14,
                      background: "#f8f5f0",
                      borderRadius: 14,
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#8a8279",
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Beste koop nu
                      </div>
                      {discountPercentage > 0 && (
                        <div
                          style={{
                            background: "#fef0e0",
                            color: "#b5720a",
                            padding: "4px 8px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {discountPercentage}% korting
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginTop: 6,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "#1a6b5a",
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          €{cheapest.price.toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1c1917",
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            marginTop: 6,
                          }}
                        >
                          bij {cheapest.name}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductAlert(product.id);
                        }}
                        style={{
                          flex: 1,
                          background: hasAlert ? "#f0faf7" : "white",
                          border: hasAlert ? "1px solid #c8ece2" : "1px solid #e8e2d9",
                          borderRadius: 10,
                          padding: "10px 12px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: hasAlert ? "#1a6b5a" : "#6b6560",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        {hasAlert ? "🔔" : "🔕"} {hasAlert ? "Melding aan" : "Melding uit"}
                      </button>

                      <button
                        onClick={(e) => handleViewRetailers(e, product.id)}
                        style={{
                          flex: 1,
                          background: "white",
                          border: "1px solid #e8e2d9",
                          borderRadius: 10,
                          padding: "10px 12px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a6b5a",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        🏪 Alle winkels ({retailers.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   COMPARE SCREEN
──────────────────────────────────────────────────────── */

function CompareScreen({ products, selectedProduct, setSelectedProductId, wishlistIds }) {
  const [sortBy, setSortBy] = useState("price-low");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState({
    priceRanges: [],
    promos: [],
    storeTypes: [],
    deliveryCosts: [],
    ratings: [],
    stockOnly: false,
  });

  const productList = Object.entries(products).map(([id, product]) => ({
    id,
    ...product,
  }));

  const wishlistProducts = productList.filter((p) => wishlistIds.includes(p.id));

  if (!selectedProduct || !wishlistIds.includes(selectedProduct.id)) {
    return (
      <div style={{ paddingBottom: 100 }}>
        <StatusBar />
        <PageHeader title="Vergelijk" subtitle="Kies een product uit je wensenlijst" />
      </div>
    );
  }

  const currentProduct = products[selectedProduct.id];
  const retailers = currentProduct?.retailers || [];
  const nextDiscount = currentProduct?.nextDiscount || "";

  // Apply filters (multiselect)
  const filteredRetailers = retailers.filter((r) => {
    // Price ranges (multiselect)
    if (filters.priceRanges.length > 0) {
      const matchesPrice = filters.priceRanges.some((range) => {
        if (range === "0-10") return r.price <= 10;
        if (range === "10-20") return r.price > 10 && r.price <= 20;
        if (range === "20+") return r.price > 20;
        return false;
      });
      if (!matchesPrice) return false;
    }

    // Promotions (multiselect)
    if (filters.promos.length > 0) {
      const hasMatchingPromo = filters.promos.some((promo) => {
        if (promo === "1+1" && r.promo?.includes("1+1")) return true;
        if (promo === "2e-halve-prijs" && r.promo?.includes("2e halve prijs")) return true;
        if (promo === "bulk" && r.promo?.includes("Bulk")) return true;
        if (promo === "percentage" && r.promo?.includes("%")) return true;
        return false;
      });
      if (!hasMatchingPromo) return false;
    }

    // Store types (multiselect)
    if (filters.storeTypes.length > 0) {
      if (!filters.storeTypes.includes(r.type)) return false;
    }

    // Delivery costs (multiselect)
    if (filters.deliveryCosts.length > 0) {
      const matchesDelivery = filters.deliveryCosts.some((cost) => {
        if (cost === "free") return r.deliveryCost === 0;
        if (cost === "0-3") return r.deliveryCost > 0 && r.deliveryCost <= 3;
        if (cost === "3+") return r.deliveryCost > 3;
        return false;
      });
      if (!matchesDelivery) return false;
    }

    // Ratings (multiselect)
    if (filters.ratings.length > 0) {
      const matchesRating = filters.ratings.some((rating) => {
        const minRating = parseFloat(rating);
        return r.rating >= minRating;
      });
      if (!matchesRating) return false;
    }

    // Stock
    if (filters.stockOnly && !r.stock) return false;

    return true;
  });

  // Apply sorting
  const sorted = [...filteredRetailers].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const resetFilters = () => {
    setFilters({
      priceRanges: [],
      promos: [],
      storeTypes: [],
      deliveryCosts: [],
      ratings: [],
      stockOnly: false,
    });
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <StatusBar />
      <PageHeader title="Vergelijk" subtitle="Beste prijzen per winkel" />

      {/* Product Selector */}
      <div style={{ padding: "0 20px 16px" }}>
        <select
          value={selectedProduct.id}
          onChange={(e) => setSelectedProductId(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 16,
            border: "2px solid #e8e2d9",
            fontSize: 15,
            fontWeight: 600,
            color: "#1c1917",
            fontFamily: "'DM Sans', sans-serif",
            background: "white",
            cursor: "pointer",
          }}
        >
          {wishlistProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Next Discount Banner */}
      {nextDiscount && (
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #fef9f0, #fdf3e4)",
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>🔮</span>
            <div
              style={{
                fontSize: 13,
                color: "#8a6914",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {nextDiscount}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sort Icons */}
      <div style={{ padding: "0 20px 16px", display: "flex", gap: 10 }}>
        <button
          onClick={() => setShowFilterModal(true)}
          style={{
            flex: 1,
            background: "white",
            border: "2px solid #e8e2d9",
            borderRadius: 14,
            padding: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#1c1917",
          }}
        >
          <FilterIcon /> Filters
        </button>
        <button
          onClick={() => setShowSortModal(true)}
          style={{
            flex: 1,
            background: "white",
            border: "2px solid #e8e2d9",
            borderRadius: 14,
            padding: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#1c1917",
          }}
        >
          <SortIcon /> Sorteren
        </button>
      </div>

      {/* Retailers */}
      <div style={{ padding: "0 20px" }}>
        {sorted.length === 0 ? (
          <div
            style={{
              background: "#f8f5f0",
              borderRadius: 16,
              padding: "30px 20px",
              textAlign: "center",
              color: "#8a8279",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Geen winkels gevonden met deze filters
          </div>
        ) : (
          sorted.map((r, i) => (
            <div
              key={r.id}
              style={{
                background: i === 0 ? "#f0faf7" : "white",
                borderRadius: 18,
                border: i === 0 ? "2px solid #c8ece2" : "2px solid #ebe6de",
                padding: "16px",
                marginBottom: 12,
                position: "relative",
              }}
            >
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "#1a6b5a",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  GOEDKOOPST
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#f8f5f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🏪
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1c1917",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8a8279",
                      fontFamily: "'DM Sans', sans-serif",
                      marginTop: 2,
                    }}
                  >
                    {r.type === "online" ? "Online" : r.type === "physical" ? "Winkel" : "Online + Winkel"} · ⭐ {r.rating}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: i === 0 ? "rgba(255,255,255,0.7)" : "#f8f5f0",
                  borderRadius: 14,
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: i === 0 ? "#1a6b5a" : "#1c1917",
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1,
                      }}
                    >
                      €{r.price.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#8a8279",
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 6,
                      }}
                    >
                      + €{r.deliveryCost.toFixed(2)} bezorging
                    </div>
                  </div>
                  {r.promo && (
                    <div
                      style={{
                        background: "#fef0e0",
                        color: "#b5720a",
                        padding: "8px 12px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {r.promo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sort Modal */}
      <Modal isOpen={showSortModal} onClose={() => setShowSortModal(false)}>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#1c1917",
            margin: "0 0 20px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Sorteren
        </h3>
        {[
          { value: "price-low", label: "Prijs laag - hoog" },
          { value: "price-high", label: "Prijs hoog - laag" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setSortBy(option.value);
              setShowSortModal(false);
            }}
            style={{
              width: "100%",
              padding: "16px 20px",
              marginBottom: 10,
              background: sortBy === option.value ? "#f0faf7" : "white",
              border: sortBy === option.value ? "2px solid #c8ece2" : "2px solid #ebe6de",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              color: "#1c1917",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {sortBy === option.value && "✓ "}
            {option.label}
          </button>
        ))}
      </Modal>

      {/* Filter Modal (Multiselect) */}
      <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#1c1917",
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Filters
          </h3>
          <button
            onClick={resetFilters}
            style={{
              background: "none",
              border: "none",
              color: "#1a6b5a",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Reset
          </button>
        </div>

        {/* Price Ranges */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1c1917",
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Prijs
          </label>
          {["0-10", "10-20", "20+"].map((range) => (
            <label
              key={range}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={filters.priceRanges.includes(range)}
                onChange={() => toggleFilter("priceRanges", range)}
                style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
              />
              €{range === "0-10" ? "0 - €10" : range === "10-20" ? "10 - €20" : "20+"}
            </label>
          ))}
        </div>

        {/* Promotions */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1c1917",
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Promotie
          </label>
          {[
            { value: "1+1", label: "1+1 gratis" },
            { value: "2e-halve-prijs", label: "2e halve prijs" },
            { value: "bulk", label: "Bulk deals" },
            { value: "percentage", label: "% korting" },
          ].map((promo) => (
            <label
              key={promo.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={filters.promos.includes(promo.value)}
                onChange={() => toggleFilter("promos", promo.value)}
                style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
              />
              {promo.label}
            </label>
          ))}
        </div>

        {/* Store Types */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1c1917",
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Winkel type
          </label>
          {[
            { value: "online", label: "Online" },
            { value: "physical", label: "Fysiek" },
            { value: "both", label: "Beide" },
          ].map((type) => (
            <label
              key={type.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={filters.storeTypes.includes(type.value)}
                onChange={() => toggleFilter("storeTypes", type.value)}
                style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
              />
              {type.label}
            </label>
          ))}
        </div>

        {/* Delivery Costs */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1c1917",
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Bezorgkosten
          </label>
          {[
            { value: "free", label: "Gratis" },
            { value: "0-3", label: "€0 - €3" },
            { value: "3+", label: "€3+" },
          ].map((cost) => (
            <label
              key={cost.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={filters.deliveryCosts.includes(cost.value)}
                onChange={() => toggleFilter("deliveryCosts", cost.value)}
                style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
              />
              {cost.label}
            </label>
          ))}
        </div>

        {/* Ratings */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1c1917",
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Winkel rating
          </label>
          {["4.0", "4.2", "4.5"].map((rating) => (
            <label
              key={rating}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={filters.ratings.includes(rating)}
                onChange={() => toggleFilter("ratings", rating)}
                style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
              />
              {rating}+
            </label>
          ))}
        </div>

        {/* Stock */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={filters.stockOnly}
              onChange={() => setFilters({ ...filters, stockOnly: !filters.stockOnly })}
              style={{ marginRight: 10, width: 18, height: 18, cursor: "pointer" }}
            />
            Alleen op voorraad
          </label>
        </div>

        <button
          onClick={() => setShowFilterModal(false)}
          style={{
            width: "100%",
            padding: "16px",
            background: "#1a6b5a",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Toepassen
        </button>
      </Modal>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ALERTS SCREEN
──────────────────────────────────────────────────────── */

function AlertsScreen({ products, selectedProduct, wishlistIds, setSelectedProductId }) {
  const [alertsOn, setAlertsOn] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState({
    "1+1": false,
    "2e-halve-prijs": false,
    "bulk": false,
    percentage: false,
  });
  const [percentageValue, setPercentageValue] = useState("");

  const productList = Object.entries(products).map(([id, product]) => ({
    id,
    ...product,
  }));

  const wishlistProducts = productList.filter((p) => wishlistIds.includes(p.id));

  if (!selectedProduct || !wishlistIds.includes(selectedProduct.id)) {
    return (
      <div style={{ paddingBottom: 100 }}>
        <StatusBar />
        <PageHeader title="Meldingen" subtitle="Kies een product uit je wensenlijst" />
      </div>
    );
  }

  const cheapest = getCheapestRetailer(products, selectedProduct.id);

  return (
    <div style={{ paddingBottom: 100 }}>
      <StatusBar />
      <PageHeader title="Meldingen" subtitle="Stel promotie-alerts in" />

      {/* Product Selector */}
      <div style={{ padding: "0 20px 20px" }}>
        <select
          value={selectedProduct.id}
          onChange={(e) => setSelectedProductId(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 16,
            border: "2px solid #e8e2d9",
            fontSize: 15,
            fontWeight: 600,
            color: "#1c1917",
            fontFamily: "'DM Sans', sans-serif",
            background: "white",
            cursor: "pointer",
          }}
        >
          {wishlistProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Price */}
      {cheapest && (
        <div
          style={{
            margin: "0 20px 20px",
            background: "#f0faf7",
            borderRadius: 18,
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#1a6b5a",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 6,
            }}
          >
            HUIDIGE LAAGSTE PRIJS
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#1a6b5a",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            €{cheapest.price.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#4a9e8a",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 4,
            }}
          >
            bij {cheapest.name}
          </div>
        </div>
      )}

      {/* Alert Toggle */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            background: "white",
            borderRadius: 18,
            border: "2px solid #ebe6de",
            padding: "18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: alertsOn ? 16 : 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1c1917",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 4,
                }}
              >
                Promotiemeldingen
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#8a8279",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {alertsOn ? "Actief" : "Uitgeschakeld"}
              </div>
            </div>
            <Toggle on={alertsOn} onToggle={() => setAlertsOn(!alertsOn)} />
          </div>

          {alertsOn && (
            <>
              <div
                style={{
                  height: 1,
                  background: "#ebe6de",
                  margin: "0 -18px 16px",
                }}
              />

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1c1917",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 12,
                }}
              >
                TYPE PROMOTIE
              </div>

              {/* 1+1 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0ebe3",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1c1917",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  1+1 gratis
                </div>
                <Toggle
                  on={promoAlerts["1+1"]}
                  onToggle={() =>
                    setPromoAlerts({ ...promoAlerts, "1+1": !promoAlerts["1+1"] })
                  }
                />
              </div>

              {/* 2e halve prijs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0ebe3",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1c1917",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  2e halve prijs
                </div>
                <Toggle
                  on={promoAlerts["2e-halve-prijs"]}
                  onToggle={() =>
                    setPromoAlerts({
                      ...promoAlerts,
                      "2e-halve-prijs": !promoAlerts["2e-halve-prijs"],
                    })
                  }
                />
              </div>

              {/* Bulk diaper deals */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0ebe3",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1c1917",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Bulk diaper deals
                </div>
                <Toggle
                  on={promoAlerts.bulk}
                  onToggle={() =>
                    setPromoAlerts({ ...promoAlerts, bulk: !promoAlerts.bulk })
                  }
                />
              </div>

              {/* % korting with minimum percentage */}
              <div
                style={{
                  padding: "12px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1c1917",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    % korting (minimaal)
                  </div>
                  <Toggle
                    on={promoAlerts.percentage}
                    onToggle={() =>
                      setPromoAlerts({
                        ...promoAlerts,
                        percentage: !promoAlerts.percentage,
                      })
                    }
                  />
                </div>
                {promoAlerts.percentage && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#8a8279",
                        marginBottom: 8,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Minimale % korting
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="Bijv. 25"
                        value={percentageValue}
                        onChange={(e) => setPercentageValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: "2px solid #e8e2d9",
                          fontSize: 15,
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          color: "#1c1917",
                          background: "#f8f5f0",
                          outline: "none",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#6b6560",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div
          style={{
            background: "#f8f5f0",
            borderRadius: 16,
            padding: "16px",
            fontSize: 13,
            color: "#6b6560",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Tip:</strong> Schakel de promotietypes in waar je op wacht om direct
          een melding te krijgen!
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   APP SHELL
──────────────────────────────────────────────────────── */

export default function App() {
  const [screen, setScreen] = useState("wishlist");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [productAlerts, setProductAlerts] = useState({});
  const [products, setProducts] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Fetch products from API
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching products from:', `${API_URL}/products`);
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Products loaded:', data);
      
      setProducts(data.products || {});
      setLastUpdated(data.lastUpdated);
      
      // Initialize wishlist with all products
      const productIds = Object.keys(data.products || {});
      if (productIds.length > 0 && wishlistIds.length === 0) {
        setWishlistIds(productIds);
        setSelectedProductId(productIds[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Initial fetch
  fetchProducts();
  
  // ✨ NIEUW: Auto-refresh elke 5 minuten
  const interval = setInterval(() => {
    console.log('🔄 Auto-refreshing prices...');
    fetchProducts();
  }, 5 * 60 * 1000); // 5 minuten in milliseconden
  
  // Cleanup: stop interval wanneer component unmounts
  return () => {
    console.log('🛑 Stopping auto-refresh');
    clearInterval(interval);
  };
}, []); // Let op: wishlistIds NIET in dependency array

  const selectedProduct = selectedProductId ? { id: selectedProductId, ...products[selectedProductId] } : null;

  const navigate = (s) => {
    setScreen(s);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const toggleWishlist = (productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleProductAlert = (productId) => {
    setProductAlerts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };
  
  // Loading state
  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "#e8e2d9", fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👶</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1917", marginBottom: 8 }}>
            Prijzen laden...
          </div>
          <div style={{ fontSize: 14, color: "#8a8279" }}>Even geduld</div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "#e8e2d9", fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1917", marginBottom: 8 }}>
            Kon prijzen niet laden
          </div>
          <div style={{ fontSize: 14, color: "#8a8279", marginBottom: 20 }}>
            {error}
          </div>
          <button onClick={() => window.location.reload()} style={{
            background: "#1a6b5a", color: "white", border: "none",
            borderRadius: 12, padding: "12px 24px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Opnieuw proberen</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#e8e2d9",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          background: "#fffcf8",
          position: "relative",
          boxShadow: "0 0 40px rgba(0,0,0,0.06)",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            height: "100vh",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {screen === "wishlist" && (
            <WishlistScreen
              products={products}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              setSelectedProductId={setSelectedProductId}
              onNavigate={navigate}
              productAlerts={productAlerts}
              toggleProductAlert={toggleProductAlert}
              lastUpdated={lastUpdated}
            />
          )}

          {screen === "compare" && (
            <CompareScreen
              products={products}
              selectedProduct={selectedProduct}
              setSelectedProductId={setSelectedProductId}
              wishlistIds={wishlistIds}
            />
          )}

          {screen === "alerts" && (
            <AlertsScreen
              products={products}
              selectedProduct={selectedProduct}
              wishlistIds={wishlistIds}
              setSelectedProductId={setSelectedProductId}
            />
          )}
        </div>

        <BottomNav active={screen} onNavigate={navigate} />
      </div>
    </div>
  );
}

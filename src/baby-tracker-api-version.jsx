import { useState, useEffect, useRef, useMemo } from "react";

/* ────────────────────────────────────────────────────────
   API CONFIGURATION
──────────────────────────────────────────────────────── */

// Change this to your API URL after deployment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/* ────────────────────────────────────────────────────────
   API HOOKS
──────────────────────────────────────────────────────── */

function useProducts() {
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data.success) {
        // Convert API data to app format
        const productsList = Object.entries(data.products).map(([id, product]) => ({
          id,
          name: product.name,
          category: product.category,
          size: product.size,
          icon: product.icon,
        }));

        setProducts(productsList);
        setProductData(data.products);
        setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  return { products, productData, loading, error, lastUpdated, refetch };
}

/* ────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────── */

function getProductData(productData, productId) {
  return productData[productId] || { retailers: [] };
}

function getCheapestRetailer(productData, productId) {
  const { retailers } = getProductData(productData, productId);
  if (!retailers.length) return null;
  return retailers.reduce((a, b) => (a.price < b.price ? a : b));
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
      <span>9:41</span>
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

function LoadingSpinner() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: "4px solid #f0ebe3",
        borderTop: "4px solid #1a6b5a",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{
        fontSize: 14,
        color: "#8a8279",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Prijzen laden...
      </p>
    </div>
  );
}

function ErrorMessage({ error, onRetry }) {
  return (
    <div style={{
      margin: "40px 20px",
      padding: "24px",
      background: "#fff5f5",
      borderRadius: 16,
      border: "1px solid #fecaca",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        color: "#991b1b",
        marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Kon prijzen niet laden
      </div>
      <div style={{
        fontSize: 13,
        color: "#7f1d1d",
        marginBottom: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {error}
      </div>
      <button
        onClick={onRetry}
        style={{
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Opnieuw proberen
      </button>
    </div>
  );
}

function LastUpdatedBanner({ lastUpdated }) {
  if (!lastUpdated) return null;

  const date = new Date(lastUpdated);
  const formattedDate = date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{
      margin: "0 20px 16px",
      padding: "10px 14px",
      background: "#f0faf7",
      borderRadius: 12,
      border: "1px solid #c8ece2",
      fontSize: 12,
      color: "#1a6b5a",
      fontFamily: "'DM Sans', sans-serif",
      textAlign: "center",
    }}>
      ⏱️ Laatst bijgewerkt: {formattedDate}
    </div>
  );
}

/* ... REST OF THE COMPONENTS (Icons, Toggle, Modal, etc.) - SAME AS BEFORE ... */

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
   WISHLIST SCREEN - UPDATED FOR API
──────────────────────────────────────────────────────── */

function WishlistScreen({
  products,
  productData,
  wishlistIds,
  toggleWishlist,
  setSelectedProductId,
  onNavigate,
  productAlerts,
  toggleProductAlert,
  lastUpdated,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleViewRetailers = (e, productId) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    onNavigate("compare");
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <StatusBar />
      <PageHeader
        title="Wensenlijst"
        subtitle="Sla producten op en zie meteen waar je het beste kunt kopen."
      />

      <LastUpdatedBanner lastUpdated={lastUpdated} />

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
                const cheapest = getCheapestRetailer(productData, product.id);
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
                        {cheapest ? `Vanaf €${cheapest.price.toFixed(2)} bij ${cheapest.name}` : 'Geen prijzen beschikbaar'}
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

      {/* REST OF WISHLIST SCREEN - SAME AS BEFORE */}
      {/* ... product cards with discount percentage ... */}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   APP SHELL - UPDATED FOR API
──────────────────────────────────────────────────────── */

export default function App() {
  const [screen, setScreen] = useState("wishlist");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [productAlerts, setProductAlerts] = useState({});
  const scrollRef = useRef(null);

  // Use API hook
  const { products, productData, loading, error, lastUpdated, refetch } = useProducts();

  // Set initial wishlist when products load
  useEffect(() => {
    if (products.length > 0 && wishlistIds.length === 0) {
      setWishlistIds([products[0].id, products[1]?.id].filter(Boolean));
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

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

  if (loading) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: "#fffcf8" }}>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <StatusBar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: "#fffcf8" }}>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <StatusBar />
        <ErrorMessage error={error} onRetry={refetch} />
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
              productData={productData}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              setSelectedProductId={setSelectedProductId}
              onNavigate={navigate}
              productAlerts={productAlerts}
              toggleProductAlert={toggleProductAlert}
              lastUpdated={lastUpdated}
            />
          )}

          {/* ... other screens ... */}
        </div>

        <BottomNav active={screen} onNavigate={navigate} />
      </div>
    </div>
  );
}

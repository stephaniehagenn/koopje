import { useState, useMemo } from 'react';

export function SearchAndFilter({ products, wishlistIds, onFilteredChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set();
    wishlistIds.forEach(id => {
      if (products[id]?.category) {
        cats.add(products[id].category);
      }
    });
    return ['all', ...Array.from(cats)];
  }, [products, wishlistIds]);
  
  // Filter products based on search and category
  const filteredIds = useMemo(() => {
    return wishlistIds.filter(id => {
      const product = products[id];
      if (!product) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        if (!nameMatch && !brandMatch) return false;
      }
      
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      
      return true;
    });
  }, [wishlistIds, products, searchQuery, categoryFilter]);
  
  // Notify parent of filtered results
  useMemo(() => {
    onFilteredChange?.(filteredIds);
  }, [filteredIds, onFilteredChange]);
  
  return (
    <div>
      {/* Search bar */}
      <div style={{ padding: "0 20px 12px" }}>
        <input
          type="text"
          placeholder="🔍 Zoek product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "2px solid #e8e2d9",
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      
      {/* Category pills */}
      {categories.length > 1 && (
        <div style={{ 
          display: "flex", 
          gap: 8, 
          padding: "0 20px 16px", 
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                background: categoryFilter === cat ? "#1a6b5a" : "#f8f5f0",
                color: categoryFilter === cat ? "white" : "#6b6560",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {cat === "all" ? "Alles" : cat}
            </button>
          ))}
        </div>
      )}
      
      {/* Results count */}
      {(searchQuery || categoryFilter !== "all") && (
        <div style={{
          padding: "0 20px 12px",
          fontSize: 13,
          color: "#8a8279",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {filteredIds.length} {filteredIds.length === 1 ? 'product' : 'producten'} gevonden
        </div>
      )}
    </div>
  );
}
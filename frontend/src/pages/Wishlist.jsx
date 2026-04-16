import React, { useContext, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { WishlistContext } from "../context/WishlistContext";
import "../styles.css";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!Array.isArray(wishlist) || wishlist.length === 0) {
      setProducts([]);
      return;
    }

    fetch(`${API_ORIGIN}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }

        const wishlistIdSet = new Set(wishlist.map((id) => String(id)));
        const activeWishlistProducts = data.filter((product) => {
          const isActive = product?.is_active === true || product?.active === true;
          return isActive && wishlistIdSet.has(String(product?.id));
        });

        setProducts(activeWishlistProducts);
      })
      .catch(() => setProducts([]));
  }, [wishlist]);

  const safeWishlist = useMemo(() => (Array.isArray(wishlist) ? wishlist : []), [wishlist]);

  return (
    <main className="wishlist-page">
      {safeWishlist.length === 0 ? (
        <section
          className="wishlist-empty-state"
          aria-live="polite"
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '2rem',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <Heart
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ width: '96px', height: '96px', color: '#d1d5db' }}
          />
          <h1
            className="wishlist-empty-title"
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.15,
              margin: 0
            }}
          >
            Your wishlist is lonely
          </h1>
          <p
            className="wishlist-empty-subtitle"
            style={{
              maxWidth: '680px',
              fontSize: '1.1rem',
              color: '#9ca3af',
              lineHeight: 1.7,
              margin: 0
            }}
          >
            Your wishlist is feeling a bit empty. Explore our unique designs and add products that tell your story!
          </p>
          <button
            type="button"
            className="wishlist-empty-cta"
            style={{
              background: '#0f766e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 34px',
              fontSize: '1rem',
              fontWeight: 600
            }}
            onClick={() => navigate("/shop")}
          >
            Explore Shop
          </button>
        </section>
      ) : (
        <section>
          <h1 className="section-title">Your Wishlist</h1>
          <div className="featured-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Wishlist;

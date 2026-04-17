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
  const { wishlist, syncWishlistFromStorage } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    syncWishlistFromStorage();
  }, [syncWishlistFromStorage]);

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
  const hasWishlistItems = products.length > 0;

  return (
    <div className="w-full min-h-screen px-4">
      <div className="max-w-7xl mx-auto">
      {!hasWishlistItems ? (
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
            gap: '12px',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <Heart
            size={82}
            strokeWidth={1.5}
            color="#d1d5db"
            aria-hidden="true"
            style={{ marginBottom: '6px' }}
          />
          <h1
            className="cart-title"
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              marginBottom: '2px'
            }}
          >
            Your wishlist is lonely
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: '#4b5563',
              maxWidth: '460px',
              lineHeight: 1.6,
              marginBottom: '1.6rem'
            }}
          >
            Your wishlist is feeling a bit empty. Explore our unique designs and add products that tell your story!
          </p>
          <button
            type="button"
            className="cart-continue-btn"
            style={{
              marginTop: '4px',
              width: '230px'
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
      </div>
    </div>
  );
};

export default Wishlist;

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { WishlistContext } from "../context/WishlistContext";
import "../styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!Array.isArray(wishlist) || wishlist.length === 0) {
      setProducts([]);
      return;
    }

    fetch(`${API_BASE_URL}/api/products`)
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
        <section className="wishlist-empty-state" aria-live="polite">
          <Heart className="wishlist-empty-icon" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="wishlist-empty-title">Your wishlist is lonely</h1>
          <p className="wishlist-empty-subtitle">
            Start adding items you love to find them later.
          </p>
          <button
            type="button"
            className="wishlist-empty-cta"
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

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { WishlistContext } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "../styles.css";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const Wishlist = () => {
  const { wishlist, syncWishlistFromStorage } = useContext(WishlistContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncWishlistFromStorage();
  }, [syncWishlistFromStorage]);

  useEffect(() => {
    let isCancelled = false;

    const loadWishlistProducts = async () => {
      if (!isCancelled) setIsLoading(true);

      if (!Array.isArray(wishlist) || wishlist.length === 0) {
        setProducts([]);
        if (!isCancelled) setIsLoading(false);
        return;
      }

      try {
        const detailedProducts = await Promise.all(
          wishlist.map(async (productId) => {
            try {
              const response = await fetch(`${API_ORIGIN}/api/products/${productId}`);
              if (!response.ok) return null;

              const data = await response.json();
              const baseProduct = data?.product || null;
              if (!baseProduct) return null;

              const isActive = baseProduct?.is_active === true || baseProduct?.active === true;
              if (!isActive) return null;

              return {
                ...baseProduct,
                variants: Array.isArray(data?.variants) ? data.variants : [],
              };
            } catch {
              return null;
            }
          })
        );

        if (!isCancelled) {
          setProducts(detailedProducts.filter(Boolean));
          setIsLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setProducts([]);
          setIsLoading(false);
        }
      }
    };

    loadWishlistProducts();

    return () => {
      isCancelled = true;
    };
  }, [wishlist]);

  const hasWishlistItems = products.length > 0;
  const wishlistCountLabel = useMemo(
    () => `${products.length} ${products.length === 1 ? "Item" : "Items"}`,
    [products.length]
  );

  const handleAddAllToCart = () => {
    if (!Array.isArray(products) || products.length === 0) return;

    let addedCount = 0;
    products.forEach((product) => {
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const fallbackVariant = variants.find((variant) => Boolean(variant?.id));
      if (!fallbackVariant) return;

      const result = addToCart(product, fallbackVariant);
      if (result?.added) addedCount += 1;
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} ${addedCount === 1 ? "item" : "items"} added to cart`);
    } else {
      toast("All available wishlist items are already in cart", { icon: "ℹ️" });
    }
  };

  return (
    <main className="shop-page wishlist-page-layout">
      {isLoading ? (
        <section className="shop-product-grid" aria-live="polite" aria-busy="true">
          <div className="wishlist-header-bar wishlist-header-skeleton">
            <div className="wishlist-header-left">
              <span className="wishlist-skeleton-chip wishlist-skeleton-title" />
            </div>

            <div className="wishlist-header-right">
              <span className="wishlist-skeleton-chip wishlist-skeleton-badge" />
              <span className="wishlist-skeleton-chip wishlist-skeleton-button" />
            </div>
          </div>

          <div className="wishlist-products-grid" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={`wishlist-skeleton-${index}`} />
            ))}
          </div>
        </section>
      ) : !hasWishlistItems ? (
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
        <section className="shop-product-grid">
          <div className="wishlist-header-bar">
            <div className="wishlist-header-left">
              <span className="wishlist-header-icon-wrap">
                <Heart className="wishlist-header-icon" size={18} fill="#e33170" stroke="#e33170" />
              </span>
              <h1 className="wishlist-header-title">My Favorites</h1>
            </div>

            <div className="wishlist-header-right">
              <span className="wishlist-header-badge">{wishlistCountLabel}</span>
              <button
                type="button"
                className="wishlist-add-all-btn"
                onClick={handleAddAllToCart}
              >
                Add All to Cart
              </button>
            </div>
          </div>

          <div className="wishlist-products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                deliveryText="Delivered by Tuesday, April 14"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Wishlist;

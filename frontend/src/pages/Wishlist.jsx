import React, { useContext, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import Lottie from 'lottie-react';
import emptyWishlistData from '../assets/empty-wishlist.json';
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

const WishlistLottie = Lottie?.default ?? Lottie;

const Wishlist = () => {
  const { wishlist, clearWishlist, syncWishlistFromStorage } = useContext(WishlistContext);
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
              const response = await fetch(`${API_ORIGIN}/api/products/${productId}?t=${Date.now()}`);
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

    clearWishlist();

    if (addedCount > 0) {
      toast.success(`${addedCount} ${addedCount === 1 ? "item" : "items"} moved to cart`);
    } else {
      toast("Wishlist cleared. Items were already in cart.", { icon: "ℹ️" });
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
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductSkeleton key={`wishlist-skeleton-${index}`} />
            ))}
          </div>
        </section>
      ) : !hasWishlistItems ? (
        <>
          <style>{`
            @media (max-width: 768px) {
              .wishlist-empty-state {
                flex-direction: column !important;
              }
              .wishlist-empty-content {
                text-align: center !important;
              }
            }
          `}</style>
          <section
            className="wishlist-empty-state"
            aria-live="polite"
            style={{
              minHeight: '70vh',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            <div className="wishlist-empty-lottie" aria-hidden="true">
              <WishlistLottie animationData={emptyWishlistData} autoPlay={true} loop={true} style={{ width: 350 }} />
            </div>
            <div className="wishlist-empty-content" style={{ textAlign: 'left', minWidth: '400px' }}>
              <h1
                className="cart-title"
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginTop: '0',
                  marginBottom: '12px'
                }}
              >
                Your wishlist is lonely
              </h1>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#4b5563',
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
                  width: '230px'
                }}
                onClick={() => navigate("/shop")}
              >
                Explore Shop
              </button>
            </div>
          </section>
        </>
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
                showMoveToCart={true}
              />
            ))}
          </div>

          {/* Continue Shopping Banner at the end of the list */}
          <div className="wishlist-end-banner" style={{
            marginTop: '3rem',
            padding: '2.5rem 2rem',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
            width: '100%',
            minHeight: '200px'
          }}>
            {/* Left illustration: Shopping Bag with Hearts */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }} className="wishlist-banner-ill-left">
              <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Floating hearts */}
                <path d="M25 45 C20 40, 15 45, 25 55 C35 45, 30 40, 25 45 Z" fill="#fecdd3" opacity="0.6" transform="scale(0.8) translate(10, 10)" />
                <path d="M40 90 C36 86, 32 90, 40 98 C48 90, 44 86, 40 90 Z" fill="#fecdd3" opacity="0.8" />
                <path d="M190 40 C186 36, 182 40, 190 48 C198 40, 194 36, 190 40 Z" fill="#fecdd3" opacity="0.7" />
                <path d="M185 85 C181 81, 177 85, 185 93 C193 85, 189 81, 185 85 Z" fill="#fecdd3" opacity="0.5" />
                
                {/* Bag handle */}
                <path d="M90 60 C90 35, 130 35, 130 60" stroke="#fecdd3" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Bag body */}
                <path d="M75 60 L145 60 C149 60, 151 63, 150 67 L140 135 C139 139, 136 142, 132 142 L88 142 C84 142, 81 139, 80 135 L70 67 C69 63, 71 60, 75 60 Z" fill="#ffe4e6" />
                {/* Heart on bag */}
                <path d="M110 90 C100 80, 85 92, 110 115 C135 92, 120 80, 110 90 Z" fill="#ffffff" />
              </svg>
            </div>

            {/* Center Content */}
            <div style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              flexGrow: 1,
              padding: '0 1rem'
            }}>
              <Heart className="w-6 h-6" style={{ color: '#ff6b6b' }} strokeWidth={2} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginTop: '12px',
                marginBottom: '6px',
                lineHeight: '1.2'
              }}>
                Your wishlist is looking good!
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#4b5563',
                marginBottom: '18px',
                lineHeight: '1.4'
              }}>
                Add more items you love and shop them anytime.
              </p>
              <button
                type="button"
                className="wishlist-continue-btn"
                style={{
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>

            {/* Right illustration: Branch with Leaves */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }} className="wishlist-banner-ill-right">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Branch stem */}
                <path d="M170 140 C160 110, 145 70, 155 20" stroke="#fecdd3" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Leaf 1 */}
                <path d="M155 20 C140 25, 120 15, 130 5 C145 0, 160 10, 155 20 Z" fill="#ffe4e6" />
                {/* Leaf 2 */}
                <path d="M152 45 C132 45, 115 35, 125 22 C140 20, 155 32, 152 45 Z" fill="#fecdd3" />
                {/* Leaf 3 */}
                <path d="M149 75 C124 75, 110 60, 120 45 C135 42, 150 58, 149 75 Z" fill="#ffe4e6" />
                {/* Leaf 4 */}
                <path d="M147 105 C122 105, 112 90, 122 75 C137 72, 148 88, 147 105 Z" fill="#fecdd3" />
              </svg>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Wishlist;

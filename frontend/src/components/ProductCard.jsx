import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

const ProductCard = ({ product, showMoveToCart = false }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useCart();

  const handleMoveToCart = (e) => {
    e.stopPropagation();
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const fallbackVariant = variants.find((variant) => Boolean(variant?.id));
    if (!fallbackVariant) {
      toast.error("Product variant not found");
      return;
    }

    const result = addToCart(product, fallbackVariant);
    toggleWishlist(product.id);

    if (result?.added) {
      toast.success("Product moved to cart");
    } else {
      toast("Product was already in cart, removed from wishlist", { icon: "ℹ" });
    }
  };
  const isWishlisted = Array.isArray(wishlist)
    ? wishlist.some((id) => String(id) === String(product.id))
    : false;

  // Resolve pricing from the first variant, with a safe fallback.
  const firstVariant = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants[0] : null;
  const basePrice = firstVariant ? Number(firstVariant.price || 0) : NaN;
  const variantMrp = firstVariant ? Number(firstVariant.mrp || 0) : NaN;
  const discountType = firstVariant ? String(firstVariant.discount_type || 'Percentage').toLowerCase() : 'percentage';
  const discountValue = firstVariant ? Number(firstVariant.discount_value) || 0 : 0;
  const hasDiscount = Boolean(firstVariant) && discountValue > 0;

  // Compute final price when discount applies
  let computedFinal = !Number.isNaN(basePrice) ? basePrice : null;
  if (hasDiscount && computedFinal !== null) {
    if (discountType === 'percentage') {
      const save = basePrice * (discountValue / 100);
      computedFinal = Math.max(0, basePrice - save);
    } else {
      computedFinal = Math.max(0, basePrice - discountValue);
    }
  }

  let displayFinalPrice = null;
  let displayMrp = null;

  if (hasDiscount && computedFinal !== null) {
    displayFinalPrice = computedFinal;
    // Prefer explicit mrp field if it's greater than final; otherwise show basePrice if that's greater
    if (!Number.isNaN(variantMrp) && variantMrp > computedFinal) {
      displayMrp = variantMrp;
    } else if (!Number.isNaN(basePrice) && basePrice > computedFinal) {
      displayMrp = basePrice;
    }
  } else {
    // No discount: show original price as primary (prefer mrp if present, else basePrice)
    if (!Number.isNaN(variantMrp) && variantMrp > 0) {
      displayFinalPrice = variantMrp;
    } else if (!Number.isNaN(basePrice) && basePrice > 0) {
      displayFinalPrice = basePrice;
    } else {
      displayFinalPrice = null;
    }
    displayMrp = null;
  }

  const displayDiscount = hasDiscount
    ? (discountType === 'percentage' ? `${discountValue}% OFF` : `Rs ${discountValue.toFixed(0)} OFF`)
    : null;

  const formatCurrency = (val) => {
    const n = Number(val);
    if (Number.isNaN(n)) return '';
    return (n % 1 === 0) ? n.toFixed(0) : n.toFixed(2);
  };

  const priceLabel = displayFinalPrice !== null ? `Rs ${formatCurrency(displayFinalPrice)}` : 'Price on request';
  const stockCount = Number(product?.stock) || 0;
  const stockLabel = stockCount <= 10
    ? `ONLY ${stockCount} LEFT!`
    : stockCount <= 30
      ? 'Low Stock'
      : 'In Stock';
  const stockColor = stockCount <= 10
    ? '#b91c1c'
    : stockCount <= 30
      ? '#ea580c'
      : '#10b981';
  const stockFontWeight = stockCount <= 10 ? 700 : 600;

  // Image slideshow state and handlers
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideshowInterval, setSlideshowInterval] = useState(null);
  const images = Array.isArray(product.images) ? product.images : [];
  const hasMultipleImages = images.length > 1;

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [slideshowInterval]);

  const handleMouseEnter = () => {
    if (!hasMultipleImages) return;
    
    // Start slideshow interval
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1000);
    setSlideshowInterval(interval);
  };

  const handleMouseLeave = () => {
    // Stop slideshow and reset to first image
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
    setCurrentImageIndex(0);
  };

  // Determine which image to display
  const displayImage = hasMultipleImages ? (images[currentImageIndex] || product.main_image) : product.main_image;

  return (
    <div className="product-card"
      style={{
        backgroundColor: '#ffffff',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: '1px solid #f1f5f9',
        borderRadius: '12px',
        padding: '12px',
        height: 'auto',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        transition: 'box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div
        style={{ position: 'relative', width: '100%' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={displayImage}
          alt={product.name}
          className="product-image"
          style={{
            marginBottom: 0,
            backgroundColor: '#f8fafc',
            opacity: 1,
            transition: 'opacity 0.6s ease-in-out'
          }}
        />
        {displayDiscount && (
          <span style={{
            position: 'absolute',
            top: '0',
            left: '0',
            margin: '4px',
            backgroundColor: '#22c55e',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
          }}>
            {displayDiscount}
          </span>
        )}
        <button
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle wishlist"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill={isWishlisted ? "#e33170" : "none"}
            stroke={isWishlisted ? "#e33170" : "#374151"}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '0.92rem',
          fontWeight: 500,
          color: '#1e293b',
          margin: 0,
          textAlign: 'left',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
          height: '2.8em'
        }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="#f59e0b" stroke="none" />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginLeft: '2px' }}>4.8</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>| 213 Reviews</span>
        </div>

        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          {displayMrp !== null && (
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '15px',
              color: '#9ca3af',
              fontWeight: 400,
              lineHeight: 1,
              textDecoration: 'line-through',
              textDecorationThickness: '1px',
              opacity: 0.9
            }}>
              {`Rs ${formatCurrency(displayMrp)}`}
            </span>
          )}
            <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '17px',
            fontWeight: 500,
            color: '#0f172a',
            lineHeight: 1.1
          }}>
            {priceLabel}
          </span>
        </div>
      </div>

      {showMoveToCart && (
        <button
          type="button"
          className="wishlist-move-to-cart-btn"
          style={{
            width: '100%',
            backgroundColor: '#111827',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.81rem',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '4px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleMoveToCart}
        >
          Move to Cart
        </button>
      )}

    </div>
  );
};

export default ProductCard;

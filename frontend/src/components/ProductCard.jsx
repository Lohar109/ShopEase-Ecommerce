import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { Star } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const isWishlisted = Array.isArray(wishlist)
    ? wishlist.some((id) => String(id) === String(product.id))
    : false;

  // Resolve optimal pricing derived from variants (prioritize lowest final price)
  let displayFinalPrice = null;
  let displayMrp = null;
  let displayDiscount = null;

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    // Fully resolve each variant's dynamic pricing
    const mappedVariants = product.variants.map(v => {
      const base = parseFloat(v.price || 0);
      const isDisc = Boolean(v.override_discount) && Number(v.discount_value) > 0;
      const dType = String(v.discount_type || 'Percentage').toLowerCase();
      const dVal = Number(v.discount_value) || 0;

      let final = base;
      if (isDisc) {
        const save = dType === 'percentage' ? (base * dVal / 100) : dVal;
        final = Math.max(0, base - save);
      }

      return { base, final, isDisc, dType, dVal };
    }).filter(o => !isNaN(o.base));

    if (mappedVariants.length > 0) {
      // Identify the absolute lowest current price point across options
      const cheapest = mappedVariants.reduce((prev, cur) => cur.final < prev.final ? cur : prev);

      displayFinalPrice = cheapest.final;
      if (cheapest.isDisc) {
        displayMrp = cheapest.base;
        displayDiscount = cheapest.dType === 'percentage' ? `${cheapest.dVal}% OFF` : `₹${cheapest.dVal} OFF`;
      }
    }
  } else {
    const base = parseFloat(product?.price);
    if (!isNaN(base)) {
      displayFinalPrice = base;
    }
  }

  const priceLabel = displayFinalPrice !== null ? `₹${displayFinalPrice.toFixed(2)}` : "Price N/A";
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
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
            fill="none"
            stroke="#374151"
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
            <span className="custom-diagonal-strike" style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              color: '#94a3b8',
              fontWeight: 400,
              lineHeight: 1
            }}>
              ₹{displayMrp.toFixed(2)}
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

    </div>
  );
};

export default ProductCard;

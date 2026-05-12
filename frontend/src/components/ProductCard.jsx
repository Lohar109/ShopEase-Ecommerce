import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";

const ProductCard = ({ product, deliveryText = "Delivered by Tuesday, April 14" }) => {
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

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.main_image} alt={product.name} className="product-image" />
      <h3 className="product-title">{product.name}</h3>
      <div className="product-card-info-row">
        <div className="product-card-price-heart-row">
          <div className="product-card-pricing-group" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className="product-price" style={{ marginBottom: 0 }}>{priceLabel}</span>
            
            {displayMrp !== null && (
              <span style={{ 
                fontSize: '1.15rem', 
                fontWeight: 600, 
                color: '#9ca3af', 
                textDecoration: 'line-through'
              }}>
                ₹{displayMrp.toFixed(2)}
              </span>
            )}

            {displayDiscount && (
              <span style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                marginLeft: '2px'
              }}>
                {displayDiscount}
              </span>
            )}
          </div>

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
              width="22" 
              height="22" 
              fill={isWishlisted ? "#ff3885" : "none"}
              stroke={isWishlisted ? "#ff3885" : "#333"}
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <p className="product-card-delivery">{deliveryText}</p>
      </div>
    </div>
  );
};

export default ProductCard;

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const isWishlisted = wishlist.includes(product.id);

  // Find the lowest price from variants
  let price = "Price N/A";
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const prices = product.variants
      .map((variant) => parseFloat(variant.price))
      .filter((p) => !isNaN(p));
    if (prices.length > 0) {
      price = `₹${Math.min(...prices).toFixed(2)}`;
    }
  }

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.main_image} alt={product.name} className="product-image" />
      <h3 className="product-title">{product.name}</h3>
      <div className="product-card-info-row">
        <div className="product-card-pricing-block">
          <span className="product-price">{price}</span>
          <p className="product-card-delivery">Delivered by Tuesday, April 14</p>
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
    </div>
  );
};

export default ProductCard;

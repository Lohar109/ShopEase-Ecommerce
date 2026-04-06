import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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
      <span className="product-price">{price}</span>
      <p className="product-card-delivery">Delivered by Tuesday, April 14</p>
      <div className="product-card-actions">
        <button 
          className="btn-card-add-to-cart" 
          onClick={(e) => { e.stopPropagation(); /* Add to cart logic */ }}
        >
          Add to Cart
        </button>
        <button 
          className="btn-card-buy-now" 
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

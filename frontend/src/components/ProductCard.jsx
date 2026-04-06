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
      price = `$${Math.min(...prices).toFixed(2)}`;
    }
  }

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.main_image} alt={product.name} className="product-image" />
      <h3 className="product-title">{product.name}</h3>
      <span className="product-price">{price}</span>
    </div>
  );
};

export default ProductCard;

import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="product-card product-skeleton-card" aria-hidden="true">
      <div className="product-skeleton-image" />
      <div className="product-skeleton-title" />
      <div className="product-skeleton-title short" />
      <div className="product-skeleton-row">
        <div className="product-skeleton-price" />
        <div className="product-skeleton-icon" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
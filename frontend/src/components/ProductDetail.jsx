import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setVariants(data.variants || []);
        setLoading(false);
        // Auto-select first size if available
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size);
        }
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error || !product) return <div className="product-detail-error">{error || "Product not found"}</div>;

  // Find selected variant
  const selectedVariant = variants.find(v => v.size === selectedSize) || variants[0] || {};

  // Unique sizes for selector
  const uniqueSizes = [...new Set(variants.map(v => v.size))];

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="product-detail-main">
        {/* Left: Images */}
        <div className="product-detail-images-col">
          <img src={selectedVariant.image || product.main_image} alt={product.name} className="product-detail-image" />
          <div className="product-detail-gallery">
            {product.images && product.images.length > 0 && product.images.map((img, i) => (
              <img key={i} src={img} alt={product.name + " gallery " + (i+1)} className="product-detail-gallery-img" />
            ))}
          </div>
        </div>
        {/* Right: Details & Actions */}
        <div className="product-detail-info-col">
          <h2 className="product-detail-title">{product.name}</h2>
          <div className="product-detail-price">₹ {selectedVariant.price || 'N/A'}</div>
          <p className="product-detail-brand">Brand: {product.brand}</p>
          <p className="product-detail-desc">{product.description}</p>
          {/* Size Selector */}
          {uniqueSizes.length > 0 && (
            <div className="product-detail-size-selector">
              <span>Size:</span>
              <div className="size-chips">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    className={`size-chip${selectedSize === size ? ' selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Stock & SKU */}
          {selectedVariant && (
            <div className="product-detail-meta">
              <span>Stock: {selectedVariant.stock ?? 'N/A'}</span>
              <span>SKU: {selectedVariant.sku ?? 'N/A'}</span>
            </div>
          )}
          {/* Action Buttons */}
          <div className="product-detail-actions">
            <button className="btn-add-to-cart">Add to Cart</button>
            <button className="btn-buy-now">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

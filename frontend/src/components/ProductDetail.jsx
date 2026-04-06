import React, { useEffect, useState, useMemo } from "react";
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
  const [mainDisplay, setMainDisplay] = useState(null);

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

  // Find selected variant
  const selectedVariant = variants.find(v => v.size === selectedSize) || variants[0] || {};
  
  // Update main display when selected variant changes, if not explicitly overriden
  useEffect(() => {
    if (selectedVariant.image || (product && product.main_image)) {
      setMainDisplay({ type: 'image', url: selectedVariant.image || product.main_image });
    }
  }, [selectedVariant, product]);

  const galleryItems = useMemo(() => {
    if (!product) return [];
    
    const items = [];
    
    // Add main variant image if exists
    if (selectedVariant.image) {
       items.push({ type: 'image', url: selectedVariant.image });
    } else if (product.main_image) {
       items.push({ type: 'image', url: product.main_image });
    }
    
    // Add additional gallery images
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            if (!items.find(i => i.url === img)) {
                items.push({ type: 'image', url: img });
            }
        });
    }

    // Add video if exists
    if (product.video_url) {
      // Must be at index 1 if it exists
      if (items.length > 0) {
         items.splice(1, 0, { type: 'video', url: product.video_url });
      } else {
         items.push({ type: 'video', url: product.video_url });
      }
    }
    
    return items;
  }, [product, selectedVariant]);
  

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error || !product) return <div className="product-detail-error">{error || "Product not found"}</div>;


  // Unique sizes for selector
  const uniqueSizes = [...new Set(variants.map(v => v.size))];
  
  const displayItems = galleryItems.slice(0, 4);
  const extraCount = galleryItems.length > 4 ? galleryItems.length - 4 : 0;

  return (
    <div className="product-detail-container">
      <div className="product-detail-main">
        {/* Left: Images */}
        <div className="product-detail-images-col">
          <div className="product-detail-gallery">
            {displayItems.map((item, i) => (
              <div 
                key={i} 
                className={`product-detail-gallery-item ${mainDisplay?.url === item.url ? 'active' : ''}`}
                onClick={() => setMainDisplay(item)}
              >
                 {item.type === 'video' ? (
                   <div className="video-thumbnail-placeholder">▶</div>
                 ) : (
                   <img src={item.url} alt={`${product.name} gallery ${i+1}`} className="product-detail-gallery-img" />
                 )}
                 {i === 3 && extraCount > 0 && (
                   <div className="gallery-overlay">+{extraCount} more</div>
                 )}
              </div>
            ))}
          </div>
          <div className="product-detail-main-display">
            {mainDisplay?.type === 'video' ? (
              <video src={mainDisplay.url} controls className="product-detail-main-media" autoPlay />
            ) : (
              <img src={mainDisplay?.url || selectedVariant.image || product.main_image} alt={product.name} className="product-detail-main-media" />
            )}
            
            <div className="product-detail-options-under-image">
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
              {/* Stock */}
              {selectedVariant && (
                <div className="product-detail-meta">
                  {selectedVariant.stock > 0 ? (
                    <span className="stock-badge in-stock">In Stock</span>
                  ) : (
                    <span className="stock-badge out-of-stock">Out of Stock</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Details & Actions */}
        <div className="product-detail-info-col">
          <p className="product-detail-brand">{product.brand}</p>
          
          <div className="product-detail-rating">
            <span className="star full">&#9733;</span>
            <span className="star full">&#9733;</span>
            <span className="star full">&#9733;</span>
            <span className="star full">&#9733;</span>
            <span className="star half">&#9733;</span>
            <span className="rating-value">4.5</span>
          </div>

          <h2 className="product-detail-title">{product.name}</h2>
          <p className="product-detail-desc">{product.description}</p>
          <p className="product-detail-delivery">Delivered by Tuesday, April 14</p>
          
          <div className="product-detail-price-group">
            <div className="product-detail-price">₹ {selectedVariant.price || 'N/A'}</div>
            <div className="product-detail-tax">All taxes included</div>
          </div>
          
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

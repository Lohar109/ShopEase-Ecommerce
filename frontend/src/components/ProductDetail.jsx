import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const ProductDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [filteredColors, setFilteredColors] = useState([]);
  const [colorThumbnails, setColorThumbnails] = useState({});
  const [designGalleryImages, setDesignGalleryImages] = useState([]);
  const [mainDisplay, setMainDisplay] = useState(null);
  const descriptionInlineRef = useRef(null);
  const [inlineDescription, setInlineDescription] = useState("");
  const [showInlineReadMore, setShowInlineReadMore] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setVariants(data.variants || []);
        setLoading(false);
        // Auto-select first size if available
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size);
          setSelectedColor(data.variants[0].color || null);
        }
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const getAvailableColors = (size) => {
    const filtered = size ? variants.filter((v) => v.size === size) : variants;
    return [...new Set(filtered.map((v) => v.color).filter(Boolean))];
  };

  // Keep available colors in sync with selected size.
  // If selected color becomes invalid for the size, pick first valid color.
  useEffect(() => {
    const colors = getAvailableColors(selectedSize);
    setFilteredColors(colors);

    if (colors.length === 0) {
      if (selectedColor !== null) setSelectedColor(null);
      return;
    }

    if (!selectedColor || !colors.includes(selectedColor)) {
      setSelectedColor(colors[0]);
    }
  }, [selectedSize, variants, selectedColor]);

  // Find selected variant using selected size and color first, then fallback in order
  const selectedVariant =
    variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || String(v.color || '').toLowerCase() === String(selectedColor).toLowerCase())
    ) ||
    variants.find((v) => (!selectedSize || v.size === selectedSize)) ||
    variants.find((v) => (!selectedColor || String(v.color || '').toLowerCase() === String(selectedColor).toLowerCase())) ||
    variants[0] ||
    {};

  // Fetch design-specific gallery when color changes
  useEffect(() => {
    if (!id || !selectedColor) {
      setDesignGalleryImages([]);
      return;
    }

    fetch(`${API_ORIGIN}/api/design-gallery/${id}/${encodeURIComponent(selectedColor)}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setDesignGalleryImages(Array.isArray(data?.images) ? data.images : []);
          return;
        }

        // No design-specific gallery for this color, fallback to default product images
        if (res.status === 404) {
          setDesignGalleryImages([]);
          return;
        }

        setDesignGalleryImages([]);
      })
      .catch(() => {
        setDesignGalleryImages([]);
      });
  }, [id, selectedColor]);

  const getVariantColorImage = (colorName) => {
    const normalized = String(colorName || '').toLowerCase();
    const sizeMatched = variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        String(v.color || '').toLowerCase() === normalized &&
        Boolean(v.image)
    );

    if (sizeMatched?.image) return sizeMatched.image;

    const fallback = variants.find(
      (v) => String(v.color || '').toLowerCase() === normalized && Boolean(v.image)
    );
    return fallback?.image || '';
  };

  useEffect(() => {
    if (!id || filteredColors.length === 0) {
      setColorThumbnails({});
      return;
    }

    let isCancelled = false;

    const loadColorThumbnails = async () => {
      const entries = await Promise.all(
        filteredColors.map(async (color) => {
          let thumbnail = '';

          try {
            const res = await fetch(`${API_ORIGIN}/api/design-gallery/${id}/${encodeURIComponent(color)}`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data?.images) && data.images.length > 0) {
                thumbnail = data.images[0];
              }
            }
          } catch {
            // Fall back to variant image below.
          }

          if (!thumbnail) {
            thumbnail = getVariantColorImage(color);
          }

          return [color, thumbnail];
        })
      );

      if (!isCancelled) {
        setColorThumbnails(Object.fromEntries(entries));
      }
    };

    loadColorThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [id, filteredColors, variants, selectedSize]);

  const galleryItems = useMemo(() => {
    if (!product) return [];

    const items = [];

    const defaultImages = Array.isArray(product.images) ? product.images : [];
    const activeImages = designGalleryImages.length > 0 ? designGalleryImages : defaultImages;

    // Use color-specific design gallery images if available, else fallback to product images
    if (activeImages.length > 0) {
      activeImages.forEach((img) => {
        if (!items.find((i) => i.url === img)) {
          items.push({ type: 'image', url: img });
        }
      });
    }

    // Final fallback if no gallery images are present
    if (items.length === 0) {
      if (selectedVariant.image) {
        items.push({ type: 'image', url: selectedVariant.image });
      } else if (product.main_image) {
        items.push({ type: 'image', url: product.main_image });
      }
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
  }, [product, selectedVariant.image, designGalleryImages]);

  // Keep main display synced with whichever gallery is currently active
  useEffect(() => {
    if (galleryItems.length === 0) {
      setMainDisplay(null);
      return;
    }

    if (!mainDisplay || !galleryItems.some((item) => item.type === mainDisplay.type && item.url === mainDisplay.url)) {
      setMainDisplay(galleryItems[0]);
    }
  }, [galleryItems, mainDisplay]);

  const specificationRows = useMemo(() => {
    const specs = product?.specifications;
    if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
      return [];
    }

    return Object.entries(specs).filter(([key, value]) => {
      const normalizedKey = String(key || "").trim().toLowerCase();
      if (!normalizedKey) return false;
      if (normalizedKey === "brand") return false;
      if (value === null || value === undefined) return false;
      return String(value).trim() !== "";
    });
  }, [product?.specifications]);

  const descriptionText = String(product?.description || "").trim();

  useEffect(() => {
    const container = descriptionInlineRef.current;
    if (!container) return;

    const recomputeInlineDescription = () => {
      if (!descriptionText) {
        setInlineDescription("");
        setShowInlineReadMore(false);
        return;
      }

      const availableWidth = container.clientWidth;
      if (!availableWidth) {
        setInlineDescription(descriptionText);
        setShowInlineReadMore(false);
        return;
      }

      const paragraph = container.querySelector(".product-detail-desc");
      const styles = window.getComputedStyle(paragraph || container);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setInlineDescription(descriptionText);
        setShowInlineReadMore(false);
        return;
      }

      const baseFont = `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
      const linkFont = `${styles.fontStyle} ${styles.fontVariant} 600 ${styles.fontSize} ${styles.fontFamily}`;

      const measureText = (text, font = baseFont) => {
        ctx.font = font;
        return ctx.measureText(text).width;
      };

      const getWrappedLines = (text) => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return [];

        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i += 1) {
          const candidate = `${currentLine} ${words[i]}`;
          if (measureText(candidate) <= availableWidth) {
            currentLine = candidate;
          } else {
            lines.push(currentLine);
            currentLine = words[i];
          }
        }

        lines.push(currentLine);
        return lines;
      };

      const maxLines = 4;
      const fullLines = getWrappedLines(descriptionText);
      if (fullLines.length <= maxLines) {
        setInlineDescription(descriptionText);
        setShowInlineReadMore(false);
        return;
      }

      const words = descriptionText.split(/\s+/).filter(Boolean);
      const reserveWidth = measureText("... ") + measureText("Read More", linkFont) + 4;

      const fitsInFourLinesWithInlineLink = (wordCount) => {
        if (wordCount <= 0) return false;
        const candidateText = words.slice(0, wordCount).join(" ");
        const lines = getWrappedLines(candidateText);

        if (lines.length > maxLines) return false;
        if (lines.length < maxLines) return true;

        return measureText(lines[maxLines - 1]) + reserveWidth <= availableWidth;
      };

      let low = 1;
      let high = words.length;
      let best = 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (fitsInFourLinesWithInlineLink(mid)) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      let truncated = words.slice(0, best).join(" ").replace(/[\s.,;:!?-]+$/, "");
      if (!truncated) {
        truncated = words[0] || "";
      }

      setInlineDescription(truncated);
      setShowInlineReadMore(true);
    };

    recomputeInlineDescription();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        recomputeInlineDescription();
      });
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", recomputeInlineDescription);
    return () => window.removeEventListener("resize", recomputeInlineDescription);
  }, [descriptionText]);
  

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error || !product) return <div className="product-detail-error">{error || "Product not found"}</div>;


  // Unique sizes for selector
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  
  const displayItems = galleryItems.slice(0, 4);
  const extraCount = galleryItems.length > 4 ? galleryItems.length - 4 : 0;

  const handleAddToCart = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const variantToAdd =
      variants.find(
        (v) =>
          v.size === selectedSize &&
          String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
      ) || selectedVariant;
    if (!variantToAdd?.id) {
      toast.error("Please select a size");
      return;
    }

    addToCart(product, variantToAdd);
  };

  const formatSpecificationValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value && typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

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
            <div className="product-detail-main-media-box">
              {mainDisplay?.type === 'video' ? (
                <video src={mainDisplay.url} controls className="product-detail-main-media" autoPlay />
              ) : (
                <img src={mainDisplay?.url || selectedVariant.image || product.main_image} alt={product.name} className="product-detail-main-media" />
              )}
            </div>
            
            <div className="product-detail-options-under-image">
              {/* Color Selector */}
              {filteredColors.length > 0 && (
                <div className="product-detail-color-selector" aria-label="Color variants">
                  <div className="product-color-thumbs-row">
                    {filteredColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`product-color-thumb ${selectedColor === color ? ' active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={`Select color ${color}`}
                      >
                        <img
                          src={colorThumbnails[color] || getVariantColorImage(color) || product.main_image}
                          alt={color}
                          className="product-color-thumb-img"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              <p className="product-detail-delivery">Delivered by Tuesday, April 14</p>
              {/* Purchasing block */}
              <div className="product-detail-purchasing-block">
                <div className="product-detail-price-group">
                  <div className="product-detail-price">₹ {selectedVariant.price || 'N/A'}</div>
                  <span className="product-detail-tax">All taxes included</span>
                </div>
                <div className="product-card-actions detail-page-buttons">
                  <button className="btn-card-add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
                  <button className="btn-card-buy-now">Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Details & Actions */}
        <div className="product-detail-info-col">
          <div className="product-detail-header-row">
            <p className="product-detail-brand">{product.brand}</p>
            <div className="product-detail-rating">
              <span className="star full">&#9733;</span>
              <span className="star full">&#9733;</span>
              <span className="star full">&#9733;</span>
              <span className="star full">&#9733;</span>
              <span className="star half">&#9733;</span>
              <span className="rating-value">4.5</span>
            </div>
          </div>

          <h2 className="product-detail-title">{product.name}</h2>
          <div className="product-detail-desc-preview" ref={descriptionInlineRef}>
            <p className="product-detail-desc">
              <span className="product-detail-desc-inline-text">
                {showInlineReadMore ? inlineDescription : descriptionText}
              </span>
              {showInlineReadMore && (
                <span className="product-detail-desc-inline-cta">
                  <span className="product-detail-read-more-ellipsis">... </span>
                  <button
                    type="button"
                    className="product-detail-read-more product-detail-read-more-inline"
                    onClick={() => setShowDescriptionModal(true)}
                  >
                    Read More
                  </button>
                </span>
              )}
            </p>
          </div>
          <button type="button" className="btn-specifications" onClick={() => setShowModal(true)}>
            <svg
              className="btn-specifications-icon btn-specifications-icon-leading"
              viewBox="0 0 20 20"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M10 1.75A8.25 8.25 0 1 0 18.25 10 8.26 8.26 0 0 0 10 1.75Zm0 1.5A6.75 6.75 0 1 1 3.25 10 6.76 6.76 0 0 1 10 3.25Zm0 2.85a1 1 0 1 0 1 1 1 1 0 0 0-1-1Zm-.75 3.3a.75.75 0 0 0 0 1.5h.25v3a.75.75 0 0 0 1.5 0V9.4a.75.75 0 0 0-.75-.75h-1Z"
              />
            </svg>
            <span className="btn-specifications-text">Product Specifications & Features</span>
            <svg
              className="btn-specifications-icon btn-specifications-icon-cta"
              viewBox="0 0 20 20"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M7.25 4.5a.75.75 0 0 1 1.06 0l4.97 4.97a.75.75 0 0 1 0 1.06L8.31 15.5a.75.75 0 0 1-1.06-1.06L11.69 10 7.25 5.56a.75.75 0 0 1 0-1.06Z"
              />
            </svg>
          </button>
          
          <div className="product-detail-trust-icons">
            <div className="trust-icon-item">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>Pay on Delivery</span>
            </div>
            <div className="trust-icon-item">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.2 14.2L11 11V7h1.5v3.4l4.3 4.3z"/></svg>
              <span>10 days Replacement</span>
            </div>
            <div className="trust-icon-item">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 0 1-2.8-.7l-1.46 1.46A7.93 7.93 0 0 0 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46A7.93 7.93 0 0 0 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
              <span>ShopEase Delivered</span>
            </div>
            <div className="trust-icon-item">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              <span>Top Brand</span>
            </div>
            <div className="trust-icon-item">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
              <span>Secure Transaction</span>
            </div>
          </div>
        </div>
        
        {/* Right: Sidebar Placeholder */}
        <div className="product-detail-sidebar-col">
          <div className="pdp-sidebar-placeholder">
            Checkout / Offers Card Placeholder
          </div>
        </div>
      </div>

      {/* Specifications Modal Overlay */}
      {showModal && (
        <div className="specs-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="specs-modal" onClick={e => e.stopPropagation()}>
            <div className="specs-modal-header">
              <h3>Product Specifications</h3>
              <button
                type="button"
                className="description-modal-close"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
            <div className="specs-modal-body">
              <table className="specs-table">
                <tbody>
                  {product?.brand && (
                    <tr>
                      <th>Brand</th>
                      <td>{product.brand}</td>
                    </tr>
                  )}
                  {specificationRows.map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{formatSpecificationValue(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Fallback details if fields are empty */}
              {!product?.brand && specificationRows.length === 0 && (
                 <p className="specs-fallback">Basic product information is currently available. Please contact support for detailed specifications.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDescriptionModal && (
        <div className="description-modal-overlay" onClick={() => setShowDescriptionModal(false)}>
          <div className="description-modal" onClick={(e) => e.stopPropagation()}>
            <div className="description-modal-header">
              <h3>Product Description</h3>
              <button
                type="button"
                className="description-modal-close"
                onClick={() => setShowDescriptionModal(false)}
              >
                Close
              </button>
            </div>
            <div className="description-modal-body">
              <p>{descriptionText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

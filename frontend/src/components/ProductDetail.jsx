import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { useCart } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import { Cpu, Monitor, Radio, Zap, Package, Share2 } from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const ProductDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showStockProgress, setShowStockProgress] = useState(false);
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [designGalleryVideo, setDesignGalleryVideo] = useState(null);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const redirectTimerRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const isWishlisted = useMemo(() => {
    return Array.isArray(wishlist)
      ? wishlist.some((wishlistId) => String(wishlistId) === String(product?.id))
      : false;
  }, [wishlist, product?.id]);

  useEffect(() => {
    setShowStockProgress(false);
    const frame = window.requestAnimationFrame(() => setShowStockProgress(true));
    return () => window.cancelAnimationFrame(frame);
  }, [id, selectedSize, selectedColor]);

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
  
  const basePrice = Number(selectedVariant?.price || 0);
  const hasDiscount = Boolean(selectedVariant?.override_discount) && Number(selectedVariant?.discount_value) > 0;
  const discTypeStr = selectedVariant?.discount_type || 'Percentage';
  const rawDiscVal = Number(selectedVariant?.discount_value) || 0;
  
  let computedFinalPrice = basePrice;
  let savingsVal = 0;
  
  if (hasDiscount) {
    if (String(discTypeStr).toLowerCase() === 'percentage') {
      savingsVal = basePrice * (rawDiscVal / 100);
    } else {
      savingsVal = rawDiscVal;
    }
    computedFinalPrice = Math.max(0, basePrice - savingsVal);
  }

  const stockCount = Number(selectedVariant?.stock || 0);
  const stockBarWidth = Math.min(100, Math.max(0, (stockCount / 10) * 100));
  const stockBarColor = stockCount <= 5 ? '#dc2626' : '#f59e0b';

  // Fetch design-specific gallery when color changes
  useEffect(() => {
    if (!id || !selectedColor) {
      setDesignGalleryImages([]);
        setDesignGalleryVideo(null);
      return;
    }

    // Only pass variant_id if this variant is marked for separate gallery
    const variantId = selectedVariant?.use_separate_gallery ? selectedVariant?.id : null;
    let url = `${API_ORIGIN}/api/design-gallery/${id}/${encodeURIComponent(selectedColor)}`;
    
    if (variantId) {
      url += `?variant_id=${encodeURIComponent(variantId)}`;
    }

    fetch(url)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setDesignGalleryImages(Array.isArray(data?.images) ? data.images : []);
            setDesignGalleryVideo(data?.video_url || null);
          return;
        }

        // No design-specific gallery for this variant/color, fallback to default product images
        if (res.status === 404) {
          setDesignGalleryImages([]);
            setDesignGalleryVideo(null);
          return;
        }

        setDesignGalleryImages([]);
          setDesignGalleryVideo(null);
      })
      .catch(() => {
        setDesignGalleryImages([]);
          setDesignGalleryVideo(null);
      });
  }, [id, selectedColor, selectedVariant?.id]);

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
            // Try variant-specific gallery first if variant has use_separate_gallery enabled
            const variantForColor = variants.find(
              (v) => String(v.color || '').toLowerCase() === String(color).toLowerCase()
            );
            
            let url = `${API_ORIGIN}/api/design-gallery/${id}/${encodeURIComponent(color)}`;
            if (variantForColor?.use_separate_gallery && variantForColor?.id) {
              url += `?variant_id=${encodeURIComponent(variantForColor.id)}`;
            }
            
            const res = await fetch(url);
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
    // Prefer variant-specific gallery video over product-level video
    const videoUrl = designGalleryVideo || product.video_url;
    if (videoUrl) {
      // Must be at index 1 if it exists
      if (items.length > 0) {
        items.splice(1, 0, { type: 'video', url: videoUrl });
      } else {
        items.push({ type: 'video', url: videoUrl });
      }
    }

    return items;
  }, [product, selectedVariant.image, designGalleryImages, designGalleryVideo]);

  // Handle auto-advance for the image carousel — pauses when video is playing
  useEffect(() => {
    if (galleryItems.length <= 1 || isVideoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [galleryItems.length, isVideoPlaying]);


  // Reset index when gallery changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedThumbnailIndex(null);
  }, [galleryItems]);

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

  const infoCardAllSpecs = useMemo(() => {
    const all = [];
    if (product?.brand) all.push(['brand', product.brand]);
    if (product?.specifications && typeof product.specifications === 'object') {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') all.push([key, value]);
      });
    }
    return all;
  }, [product]);

  
  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error || !product) return <div className="product-detail-error">{error || "Product not found"}</div>;


  // Unique sizes for selector
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

  const resolveVariantToAdd = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return null;
    }

    const variantToAdd =
      variants.find(
        (v) =>
          v.size === selectedSize &&
          String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
      ) || selectedVariant;

    if (!variantToAdd?.id) {
      toast.error("Please select a size");
      return null;
    }

    return variantToAdd;
  };

  const handleAddToCart = () => {
    const variantToAdd = resolveVariantToAdd();
    if (!variantToAdd) return;
    addToCart(product, variantToAdd);
  };

  const handleBuyNow = () => {
    const variantToAdd = resolveVariantToAdd();
    if (!variantToAdd) return;

    const normalizedSize = variantToAdd.size || null;
    const normalizedColor = variantToAdd.color || null;
    const existsInCart = cartItems.some(
      (item) =>
        item.productId === product.id &&
        (item.size || null) === normalizedSize &&
        (item.color || null) === normalizedColor
    );

    const nextCartItem = {
      cartItemId: `${product.id}-${variantToAdd.id}`,
      productId: product.id,
      variantId: variantToAdd.id,
      productName: product.name,
      image: variantToAdd.image || product.main_image || '',
      size: normalizedSize,
      color: normalizedColor,
      price: variantToAdd.price ?? null,
      quantity: 1,
    };

    const nextCartItems = existsInCart ? cartItems : [...cartItems, nextCartItem];
    const nextTotal = nextCartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
    const platformFee = 250;
    const memberDiscount = -5000;
    const nextGrandTotal = nextTotal + platformFee + memberDiscount;

    addToCart(product, variantToAdd);
    setIsRedirectingToCheckout(true);

    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
    }

    redirectTimerRef.current = window.setTimeout(() => {
      navigate('/checkout/shipping', {
        state: {
          cartItems: nextCartItems,
          total: nextGrandTotal,
        },
      });
    }, 250);
  };

  const formatSpecificationValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value && typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <>
      {/* Master single-column layout */}
      <div className="pdp-master-grid">
        {/* Expanded: Product Card (full width) */}
        <div className="pdp-left-col" style={{ gridColumn: '1 / -1' }}>
          <div className="product-detail-container">
            <div className="product-detail-main">
              {/* Left: Images */}
              <div className="product-detail-images-col">
                <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'stretch', width: '100%' }}>
                  
                  {/* Vertical Thumbnails (Left Side) */}
                  {galleryItems.length > 1 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '80px',
                      flexShrink: 0,
                      alignSelf: 'stretch',
                    }}>
                      {galleryItems.slice(0, 5).map((item, idx) => {
                        const isLastItem = idx === 4 && galleryItems.length > 5;
                        const isActive = selectedThumbnailIndex === idx;
                        const remainingCount = galleryItems.length - 4;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentImageIndex(idx);
                              setSelectedThumbnailIndex(idx);
                            }}
                            style={{
                              position: 'relative',
                              width: '80px',
                              aspectRatio: '1/1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isActive ? '2px solid #111827' : '1px solid #e5e7eb',
                              cursor: 'pointer',
                              backgroundColor: '#f9fafb',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {item.type === 'video' ? (
                              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <video 
                                  src={item.url} 
                                  style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} 
                                  muted
                                />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)' }}>
                                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={`Thumbnail ${idx + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                              />
                            )}

                            {/* Plus Overlay for the 5th item */}
                            {isLastItem && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: '14px',
                                fontFamily: 'Poppins, sans-serif',
                                zIndex: 5
                              }}>
                                +{remainingCount}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Main Image Display (Right Side) */}
                  <div className="product-detail-main-display" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div className="product-detail-main-media-box"
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'default', flexGrow: 1, width: '100%', minHeight: 'auto' }}
                    >
                      {/* Floating Share + Wishlist Buttons */}
                      <button
                        className="pdp-floating-share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = window.location.href;
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url).then(() => {
                              try { toast.success('Link Copied!'); } catch (e) {}
                            }).catch(() => {
                              try { toast.error('Failed to copy'); } catch (e) {}
                            });
                          } else {
                            try {
                              const el = document.createElement('textarea');
                              el.value = url;
                              el.setAttribute('readonly', '');
                              el.style.position = 'absolute';
                              el.style.left = '-9999px';
                              document.body.appendChild(el);
                              el.select();
                              document.execCommand('copy');
                              document.body.removeChild(el);
                              try { toast.success('Link Copied!'); } catch (e) {}
                            } catch (err) {
                              try { toast.error('Failed to copy'); } catch (e) {}
                            }
                          }
                        }}
                        aria-label="Copy product link"
                      >
                        <Share2 size={18} />
                      </button>

                      <button
                        className={`pdp-floating-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        aria-label="Toggle wishlist"
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="#374151"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>

                      {/* Static Main Media Frame */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                        {galleryItems[currentImageIndex]?.type === 'video' ? (
                          <video
                            key={galleryItems[currentImageIndex]?.url}
                            src={galleryItems[currentImageIndex]?.url}
                            controls
                            className="product-detail-main-media"
                            autoPlay
                            muted
                            controlsList="nodownload nofullscreen noplaybackrate"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => {
                              setIsVideoPlaying(false);
                              if (galleryItems.length > 1) {
                                setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
                              }
                            }}
                          />
                        ) : (
                          <img
                            src={galleryItems[currentImageIndex]?.url}
                            alt={`${product.name}`}
                            className="product-detail-main-media"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'default' }}
                          />
                        )}
                      </div>

                      {/* Pagination Dots */}
                      {galleryItems.length > 1 && (
                        <div className="carousel-dots" style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                          {galleryItems.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              aria-label={`Go to slide ${i + 1}`}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                transition: 'all 300ms ease',
                                backgroundColor: i === currentImageIndex ? '#e33170' : '#d1d5db',
                                transform: i === currentImageIndex ? 'scale(1.3)' : 'scale(1)'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              {/* Right: Details & Actions */}
              <div className="product-detail-info-col flex flex-col gap-6">
                <div className="product-detail-header-stack flex flex-col gap-0">
                  <h2 className="product-detail-title text-2xl font-extrabold text-gray-900 leading-tight mb-[12px]">{product.name}</h2>
                </div>

                {/* Color Selector */}
                {filteredColors.length > 0 && (
                  <div className="product-detail-color-selector" aria-label="Color variants">
                    <p className="product-detail-color-label">
                      <span className="product-detail-color-label-text">Selected color:</span>
                      <span className="product-detail-color-label-value">{selectedColor || filteredColors[0]}</span>
                    </p>
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
                  <div className="product-detail-size-selector" aria-label="Size variants">
                    <p className="product-detail-size-label">
                      <span className="product-detail-size-label-text">Selected size:</span>
                      <span className="product-detail-size-label-value">{selectedSize || uniqueSizes[0]}</span>
                    </p>
                    <div className="size-chips">
                      {uniqueSizes.map((size) => {
                        const sizeVariant = variants.find(
                          (v) => v.size === size &&
                            String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
                        ) || variants.find((v) => v.size === size);
                        const isOOS = !sizeVariant || sizeVariant.stock === 0;
                        return (
                          <button
                            key={size}
                            className={`size-chip${selectedSize === size ? ' selected' : ''}${isOOS ? ' oos' : ''}`}
                            onClick={() => !isOOS && setSelectedSize(size)}
                            disabled={isOOS}
                            title={isOOS ? 'Out of Stock' : size}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scarcity + Delivery row */}
                <div className="pdp-stock-delivery-row">
                  {stockCount === 0 ? (
                    <span className="pdp-scarcity-badge pdp-scarcity-badge--oos">Out of Stock</span>
                  ) : stockCount > 0 && stockCount <= 10 ? (
                    <div className="pdp-stock-progress-block" aria-live="polite">
                      <div className="pdp-stock-progress-label">
                        <span className="pdp-stock-progress-text">
                          Only <strong>{stockCount}</strong> left
                        </span>
                      </div>
                      <div className="pdp-stock-progress-track" aria-hidden="true">
                        <div
                          className="pdp-stock-progress-fill"
                          style={{
                            width: showStockProgress ? `${stockBarWidth}%` : '0%',
                            backgroundColor: stockBarColor,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Price Section */}
                <div className="product-detail-purchasing-block">
                  <div className="product-detail-price-group" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                      <span className="product-detail-price" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827' }}>
                        ₹ {computedFinalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      
                      {hasDiscount && (
                        <>
                          <span style={{ fontSize: '1.125rem', textDecoration: 'line-through', color: '#9ca3af', fontWeight: 500 }}>
                            ₹ {basePrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                          <span style={{ 
                            backgroundColor: '#d6517c', 
                            color: 'white', 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transform: 'translateY(-2px)'
                          }}>
                            {String(discTypeStr).toLowerCase() === 'percentage' ? `${rawDiscVal}% OFF` : `₹${rawDiscVal} OFF`}
                          </span>
                        </>
                      )}
                    </div>

                    {hasDiscount && (
                      <div style={{ color: '#d6517c', fontSize: '0.82rem', fontWeight: 600, marginTop: 0 }}>
                        You save ₹ {savingsVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>
                    )}

                    <span className="product-detail-tax" style={{ display: 'block', marginTop: hasDiscount ? 2 : 4 }}>All taxes included</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="product-card-actions detail-page-buttons">
                    <button className="btn-card-add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
                    <button className="btn-card-buy-now" onClick={handleBuyNow} disabled={isRedirectingToCheckout}>
                      {isRedirectingToCheckout ? 'Redirecting to checkout...' : 'Buy Now'}
                    </button>
                  </div>
                </div>

                {/* Trust Badges at the very bottom */}
                <div className="product-detail-trust-icons mt-auto">
                  <div className="trust-icon-item">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    <span>Pay on Delivery</span>
                  </div>
                  <div className="trust-icon-item">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.2 14.2L11 11V7h1.5v3.4l4.3 4.3z" /></svg>
                    <span>10 days Replacement</span>
                  </div>
                  <div className="trust-icon-item">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 0 1-2.8-.7l-1.46 1.46A7.93 7.93 0 0 0 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46A7.93 7.93 0 0 0 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" /></svg>
                    <span>ShopEase Delivered</span>
                  </div>
                  <div className="trust-icon-item">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                    <span>Top Brand</span>
                  </div>
                  <div className="trust-icon-item">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                    <span>Secure Transaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* Specifications Modal - Dynamic & Compact */}
      {showModal && (
        <div className="specs-drawer-overlay" onClick={() => setShowModal(false)}>
          <div className="specs-drawer" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="specs-drawer-header">
              <h2>Specifications & Features</h2>
              <button
                type="button"
                className="specs-drawer-close"
                onClick={() => setShowModal(false)}
                aria-label="Close specifications"
              >
                Close
              </button>
            </div>

            {/* Content - Dynamic Specs */}
            <div className="specs-drawer-body">
              {(() => {
                if (!product?.specifications || Object.keys(product.specifications).length === 0) {
                  return <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>No specifications available</p>;
                }

                return (
                  <div className="specs-grid">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key.toUpperCase()}</span>
                        <span className="spec-value">{String(value || 'N/A')}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ProductDetail;

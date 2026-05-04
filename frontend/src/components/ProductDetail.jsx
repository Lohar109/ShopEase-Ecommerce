import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { Cpu, Monitor, Radio, Zap, Package, X } from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const LightboxModal = ({ items, currentIndex, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const handlePrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeItem = items[activeIndex];

  return (
    <div className="pdp-lightbox-overlay" onClick={onClose}>
      <button
        className="pdp-lightbox-close"
        onClick={onClose}
        aria-label="Close preview"
        style={{ zIndex: 10 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="pdp-lightbox-main-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdp-lightbox-content">
          {items.length > 1 && (
            <>
              <button className="pdp-lightbox-arrow pdp-lightbox-arrow--left" onClick={handlePrev}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button className="pdp-lightbox-arrow pdp-lightbox-arrow--right" onClick={handleNext}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
          {activeItem?.type === 'video' ? (
            <video
              src={activeItem.url}
              controls
              autoPlay
              loop
              muted
              controlsList="nodownload nofullscreen noplaybackrate"
              className="pdp-lightbox-img"
              style={{ maxHeight: '80vh', width: 'auto', margin: '0 auto', borderRadius: '0.5rem', background: '#000', display: 'block' }}
            />
          ) : (
            <img
              src={activeItem?.url}
              alt="Product preview"
              className="pdp-lightbox-img"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const RateProductForm = ({ product }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaPreviewUrlsRef = useRef([]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const addMediaFiles = (files, setFiles) => {
    const mediaItems = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      mediaPreviewUrlsRef.current.push(previewUrl);
      return { file, previewUrl };
    });

    setFiles((prev) => [...prev, ...mediaItems]);
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotoFiles((prev) => {
      const nextFiles = [...prev];
      const [removed] = nextFiles.splice(indexToRemove, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
        mediaPreviewUrlsRef.current = mediaPreviewUrlsRef.current.filter((url) => url !== removed.previewUrl);
      }
      return nextFiles;
    });
  };

  const handleRemoveVideo = (indexToRemove) => {
    setVideoFiles((prev) => {
      const nextFiles = [...prev];
      const [removed] = nextFiles.splice(indexToRemove, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
        mediaPreviewUrlsRef.current = mediaPreviewUrlsRef.current.filter((url) => url !== removed.previewUrl);
      }
      return nextFiles;
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    addMediaFiles(files, setPhotoFiles);
    e.target.value = "";
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    addMediaFiles(files, setVideoFiles);
    e.target.value = "";
  };

  const clearMediaPreviews = () => {
    mediaPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    mediaPreviewUrlsRef.current = [];
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (reviewText.trim() === "") {
      toast.error("Please write a review");
      return;
    }
    toast.success("Review submitted successfully!");
    setRating(0);
    setReviewText("");
    setPhotoFiles([]);
    setVideoFiles([]);
    clearMediaPreviews();
  };

  useEffect(() => {
    return () => {
      clearMediaPreviews();
    };
  }, []);

  return (
    <div className="review-card">
      <h3>Rate this Product</h3>

      {/* Star Rating */}
      <div className="star-rating-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={star <= (hoverRating || rating) ? "active" : ""}
          >
            ★
          </button>
        ))}
      </div>

      {/* Compact Media Bar */}
      <div className="media-upload-stack">
        <div className="media-row">
          <div className="preview-container">
            {photoFiles.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="thumb-wrapper">
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="thumb-img"
                />
                <button
                  type="button"
                  className="delete-x"
                  onClick={() => handleRemovePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="upload-btn-premium"
            onClick={() => photoInputRef.current?.click()}
          >
            Add Photo
          </button>
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="custom-file-upload"
          />
        </div>

        <div className="media-row">
          <div className="preview-container">
            {videoFiles.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="thumb-wrapper">
                <video
                  src={item.previewUrl}
                  className="thumb-img"
                  muted
                  playsInline
                />
                <button
                  type="button"
                  className="delete-x"
                  onClick={() => handleRemoveVideo(index)}
                  aria-label={`Remove video ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="upload-btn-premium"
            onClick={() => videoInputRef.current?.click()}
          >
            Add Video
          </button>
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            className="custom-file-upload"
          />
        </div>
      </div>

      {/* Written Review */}
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="How was your experience?"
        className="review-textarea"
      />

      {/* Submit Button */}
      <div className="submit-review-wrapper">
        <button
          type="button"
          onClick={handleSubmitReview}
          className="submit-review-btn"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [infoTab, setInfoTab] = useState('description');
  const infoCardDescriptionMeasureRef = useRef(null);
  const infoCardFeatureRowRefs = useRef([]);
  const [infoCardDescriptionHeight, setInfoCardDescriptionHeight] = useState(0);
  const [infoCardVisibleFeatureCount, setInfoCardVisibleFeatureCount] = useState(null);
  const [infoCardHasMoreFeatures, setInfoCardHasMoreFeatures] = useState(false);
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

  // Handle auto-advance for the image carousel — pauses when lightbox is open or video is playing
  useEffect(() => {
    if (galleryItems.length <= 1 || showLightbox || isVideoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [galleryItems.length, showLightbox, isVideoPlaying]);

  // Close lightbox on Escape key
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') setShowLightbox(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset index when gallery changes
  useEffect(() => {
    setCurrentImageIndex(0);
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

  useEffect(() => {
    if (!product) return;

    const descEl = infoCardDescriptionMeasureRef.current;
    const rows = infoCardFeatureRowRefs.current || [];
    if (!descEl) return;

    const measure = () => {
      try {
        const descRect = descEl.getBoundingClientRect();
        const descHeight = Math.round(descRect.height);
        setInfoCardDescriptionHeight(descHeight);

        let cum = 0;
        let visible = rows.length;

        for (let i = 0; i < rows.length; i += 1) {
          const el = rows[i];
          if (!el) continue;
          const h = Math.round(el.getBoundingClientRect().height);
          if (cum + h > descHeight) {
            visible = i;
            break;
          }
          cum += h;
        }

        const bounded = Math.max(0, Math.min(visible, infoCardAllSpecs.length));
        setInfoCardVisibleFeatureCount(bounded || 0);
        setInfoCardHasMoreFeatures(infoCardAllSpecs.length > bounded);
      } catch (e) {
        // measurement failure - fall back to default
        setInfoCardVisibleFeatureCount(Math.min(8, infoCardAllSpecs.length));
        setInfoCardHasMoreFeatures(infoCardAllSpecs.length > 8);
      }
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(descEl);
      window.addEventListener('resize', measure);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', measure);
      };
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [product, infoCardAllSpecs]);

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
    <>
      {/* Master split layout */}
      <div className="pdp-master-grid">
        {/* Left: Product Card (8 cols) */}
        <div className="pdp-left-col">
          <div className="product-detail-container">
            <div className="product-detail-main">
              {/* Left: Images */}
              <div className="product-detail-images-col">
                <div className="product-detail-main-display">
                  <div className="product-detail-main-media-box"
                    style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}
                    onClick={() => {
                      const current = galleryItems[currentImageIndex];
                      if (current && current.type !== 'video') setShowLightbox(true);
                    }}
                  >
                    <div
                      className="carousel-track"
                      style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        transition: 'transform 500ms ease-in-out',
                        transform: `translateX(-${currentImageIndex * 100}%)`
                      }}
                    >
                      {galleryItems.map((item, i) => (
                        <div key={i} className="carousel-slide" style={{ flex: '0 0 100%', position: 'relative', width: '100%', height: '100%' }}>
                          {item.type === 'video' ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <video
                                src={item.url}
                                controls
                                className="product-detail-main-media"
                                autoPlay={i === currentImageIndex}
                                muted
                                controlsList="nodownload nofullscreen noplaybackrate"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                                onPlay={() => setIsVideoPlaying(true)}
                                onPause={() => setIsVideoPlaying(false)}
                                onEnded={() => {
                                  setIsVideoPlaying(false);
                                  setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
                                }}
                              />
                              {/* Overlay covers top 80% — leaves native controls accessible at bottom */}
                              <div
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80%', zIndex: 10, cursor: 'pointer' }}
                                onClick={() => setShowLightbox(true)}
                              />
                            </div>
                          ) : (
                            <img src={item.url} alt={`${product.name} gallery ${i + 1}`} className="product-detail-main-media" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Navigation Dots */}
                    {galleryItems.length > 1 && (
                      <div className="carousel-dots" style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
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

                  <div className="product-detail-options-under-image">
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
                      {selectedVariant && (() => {
                        const stock = selectedVariant.stock;
                        if (stock === 0) return (
                          <span className="pdp-scarcity-badge pdp-scarcity-badge--oos">Out of Stock</span>
                        );
                        if (stock > 0 && stock <= 10) return (
                          <span className="pdp-scarcity-badge pdp-scarcity-badge--low">Only {stock} left! Hurry up!</span>
                        );
                        return null;
                      })()}
                      <span className="pdp-delivery-text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#16a34a' }}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                        Delivered by <strong>Tuesday, April 14</strong>
                      </span>
                    </div>
                    {/* Purchasing block */}
                    <div className="product-detail-purchasing-block">
                      <div className="product-detail-price-group">
                        <div className="product-detail-price">₹ {selectedVariant.price || 'N/A'}<span className="product-detail-tax">All taxes included</span></div>
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
                <div className="product-detail-header-stack flex flex-col gap-0">
                  <h2 className="product-detail-title text-2xl font-extrabold text-gray-900 leading-tight mb-[4px]">{product.name}</h2>
                </div>

                <div className="rating-badge-container mb-2">
                  <span className="rating-val">
                    {product.rating || '4.4'}
                    <span className="rating-star">★</span>
                  </span>
                  <div className="rating-divider" />
                  <span className="rating-count-text">{product.ratingCount || '13'} Ratings</span>
                </div>

                <div className="product-detail-info-card bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="product-detail-info-tabs flex items-stretch">
                    <button type="button" className={`product-detail-info-tab ${infoTab === 'description' ? 'active' : 'inactive'}`} onClick={() => setInfoTab('description')}>Description</button>
                    <button type="button" className={`product-detail-info-tab ${infoTab === 'features' ? 'active' : 'inactive'}`} onClick={() => setInfoTab('features')}>Features</button>
                  </div>

                  {/* Hidden measurement DOM (absolute & non-interactive) */}
                  <div className="product-detail-info-measure" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }}>
                    <div className="product-detail-info-content p-8">
                      <div className="product-detail-info-description" ref={infoCardDescriptionMeasureRef}>
                        <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
                      </div>

                      <div className="product-detail-info-features">
                        {(() => {
                          const allSpecs = infoCardAllSpecs;
                          infoCardFeatureRowRefs.current = [];
                          return (
                            <div className="product-detail-features-list">
                              {allSpecs.map(([key, value], idx) => (
                                <div
                                  key={`${key}-${idx}`}
                                  ref={(el) => (infoCardFeatureRowRefs.current[idx] = el)}
                                  className="product-detail-feature-row flex items-center py-3 border-b border-gray-50 last:border-0"
                                >
                                  <div className="product-detail-feature-key w-40 text-[10px] font-bold uppercase text-gray-400">{key}</div>
                                  <div className="product-detail-feature-value flex-1 text-sm font-bold text-gray-900">{formatSpecificationValue(value)}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="product-detail-info-content p-8" style={{ height: '280px' }}>
                    {infoTab === 'description' ? (
                      <div className="product-detail-info-description">
                        <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
                      </div>
                    ) : (
                      <div className="product-detail-info-features">
                        {(() => {
                          const allSpecs = infoCardAllSpecs;
                          const features = allSpecs.slice(0, 6);
                          if (features.length === 0) return null;
                          const hasMore = allSpecs.length > 6;

                          return (
                            <div className="product-detail-features-list">
                              {features.map(([key, value], idx) => {
                                const isLast = idx === 5;
                                let displayValue = formatSpecificationValue(value);
                                
                                // Truncate to 2 words on 6th item if there are more specs
                                if (isLast && hasMore) {
                                  const words = displayValue.split(' ').slice(0, 2).join(' ');
                                  displayValue = words + '...';
                                }

                                return (
                                  <div key={`${key}-${idx}`} className="product-detail-feature-row" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb', gap: '1rem' }}>
                                    <div className="product-detail-feature-key text-[10px] font-bold uppercase text-gray-500">{key}</div>
                                    {isLast && hasMore ? (
                                      <div className="flex items-center justify-between w-full">
                                        <span className="truncate flex-1 text-[9px] font-medium text-gray-900">{displayValue}</span>
                                        <span className="whitespace-nowrap shrink-0 text-[#D10049] font-medium text-[9px] ml-2">
                                          <button type="button" className="product-detail-feature-view-all" onClick={() => setShowModal(true)}>View all</button>
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="text-[9px] font-medium text-gray-900">{displayValue}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-detail-trust-icons">
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

        {/* Right: Rate this Product (4 cols) */}
        <div className="pdp-right-col">
          <RateProductForm product={product} />
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
                // Collect all specs dynamically
                const allSpecs = [];
                
                return (
                  <div className="specs-table">
                    {product && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">Brand</span>
                          <span className="spec-value">{product.brand || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Material</span>
                          <span className="spec-value">{product.material || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Color</span>
                          <span className="spec-value">{selectedColor || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Size</span>
                          <span className="spec-value">{selectedSize || 'N/A'}</span>
                        </div>
                      </>
                    )}
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

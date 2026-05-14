import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { useCart } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import { ChevronRight, Star, Cpu, Monitor, Radio, Zap, Package, Share2 } from "lucide-react";

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
  const [selectedSubSize, setSelectedSubSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [filteredColors, setFilteredColors] = useState([]);
  const [colorThumbnails, setColorThumbnails] = useState({});
  const [designGalleryImages, setDesignGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [designGalleryVideo, setDesignGalleryVideo] = useState(null);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const redirectTimerRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  // In-memory cache to dedupe design-gallery requests across renders
  const designGalleryCacheRef = useRef(new Map());

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
          const firstVariant = data.variants[0];
          const firstSize = getVariantSizeValue(firstVariant);
          const firstSubSize = String(firstVariant?.sub_size || '').trim() || null;
          setSelectedSize(firstSize || null);
          setSelectedSubSize(firstSubSize);
          setSelectedColor(firstVariant.color || null);
        }
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/categories`)
      .then((res) => res.json())
      .then((data) => setAllCategories(Array.isArray(data) ? data : []))
      .catch(() => setAllCategories([]));
  }, []);

  const breadcrumbItems = useMemo(() => {
    const categoryById = new Map(
      allCategories
        .filter((category) => category?.id)
        .map((category) => [String(category.id), category])
    );

    const productCategoryId = String(product?.category_id || '').trim();
    const currentCategory = productCategoryId ? categoryById.get(productCategoryId) : null;
    if (!currentCategory) return [];

    const lineage = [];
    let cursor = currentCategory;

    while (cursor) {
      lineage.unshift(cursor);
      cursor = cursor.parent_id ? categoryById.get(String(cursor.parent_id)) || null : null;
    }

    const visibleCategories = lineage.length > 1 ? lineage.slice(-2) : lineage;

    return visibleCategories.map((category, index, array) => {
      const isLast = index === array.length - 1;
      const parentCategory = array.length > 1 ? array[0] : category;
      const query = array.length > 1
        ? `?category=${encodeURIComponent(parentCategory.name)}&subcategory=${encodeURIComponent(category.name)}`
        : `?category=${encodeURIComponent(category.name)}`;

      return {
        label: category.name,
        to: `/shop${query}`,
        isLast,
      };
    });
  }, [allCategories, product?.category_id]);

  function parseVariantSize(variant) {
    const legacySize = String(variant?.size || '').trim();
    const sizeValue = String(variant?.size_value || '').trim();
    const sizeUnit = String(variant?.size_unit || '').trim();
    const sizeInfo = String(variant?.size_info || '').trim();

    if (sizeValue || sizeUnit || sizeInfo) {
      return {
        size_value: sizeValue || legacySize,
        size_unit: sizeUnit,
        size_info: sizeInfo,
      };
    }

    const legacyMatch = legacySize.match(/^([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z%]+)?\s*(.*)$/);
    if (!legacyMatch) {
      return { size_value: legacySize, size_unit: '', size_info: '' };
    }

    return {
      size_value: String(legacyMatch[1] || '').trim() || legacySize,
      size_unit: String(legacyMatch[2] || '').trim(),
      size_info: String(legacyMatch[3] || '').trim(),
    };
  }

  function getVariantSizeValue(variant) {
    const parsed = parseVariantSize(variant);
    const source = String(parsed.size_value || variant?.size || '').trim();
    const numericMatch = source.match(/^([0-9]+(?:\.[0-9]+)?)/);
    return numericMatch ? numericMatch[1] : source;
  }

  function getVariantSubSizeValue(variant) {
    return String(variant?.sub_size || '').trim();
  }

  function getVariantSubSizeUnit(variant) {
    return String(variant?.sub_size_unit || '').trim();
  }

  function getVariantVariety(variant) {
    return String(variant?.variety || variant?.variety_label || '').trim();
  }

  function getVariantFullSizeLabel(variant) {
    const parsed = parseVariantSize(variant);
    const base = [parsed.size_value, parsed.size_unit].filter(Boolean).join(' ');
    return [base, parsed.size_info].filter(Boolean).join(' ').trim() || String(variant?.size || '').trim();
  }

  const sizeGroups = useMemo(() => {
    const grouped = new Map();

    variants.forEach((variant) => {
      const sizeValue = getVariantSizeValue(variant);
      if (!sizeValue) return;

      const parsed = parseVariantSize(variant);
      if (!grouped.has(sizeValue)) {
        grouped.set(sizeValue, {
          size_value: sizeValue,
          size_unit: String(variant?.size_unit || parsed.size_unit || '').trim(),
          variety: getVariantVariety(variant),
          items: [],
        });
      }

      const group = grouped.get(sizeValue);
      group.items.push(variant);
      if (!group.size_unit) {
        group.size_unit = String(variant?.size_unit || parsed.size_unit || '').trim();
      }
      if (!group.variety) {
        group.variety = getVariantVariety(variant);
      }
    });

    return Array.from(grouped.values()).map((group) => {
      const subOptions = new Map();

      group.items.forEach((variant) => {
        const subSize = getVariantSubSizeValue(variant);
        const subSizeUnit = getVariantSubSizeUnit(variant);
        const optionVariety = getVariantVariety(variant) || group.variety || 'option';
        const key = subSize || '__default__';

        if (!subOptions.has(key)) {
          subOptions.set(key, {
            value: subSize,
            sub_size_unit: subSizeUnit,
            label: [subSize, subSizeUnit].filter(Boolean).join(' ').trim() || 'Default',
            variety: optionVariety,
            items: [],
          });
        }

        const subOption = subOptions.get(key);
        subOption.items.push(variant);
        if (!subOption.sub_size_unit && subSizeUnit) {
          subOption.sub_size_unit = subSizeUnit;
        }
        if (!subOption.variety && optionVariety) {
          subOption.variety = optionVariety;
        }
      });

      return {
        ...group,
        sub_options: Array.from(subOptions.values()),
      };
    });
  }, [variants]);

  const selectedSizeGroup = useMemo(() => {
    if (sizeGroups.length === 0) return null;
    return sizeGroups.find((group) => group.size_value === selectedSize) || sizeGroups[0];
  }, [sizeGroups, selectedSize]);

  const selectedSubOptions = selectedSizeGroup?.sub_options || [];

  const selectedSubOption = useMemo(() => {
    if (selectedSubOptions.length === 0) return null;
    return selectedSubOptions.find((option) => option.value === selectedSubSize) || selectedSubOptions[0];
  }, [selectedSubOptions, selectedSubSize]);

  const visibleSubOptions = useMemo(
    () => selectedSubOptions.filter((option) => option.value),
    [selectedSubOptions]
  );

  const hasMultipleSubSizes = visibleSubOptions.length > 1;

  // Find selected variant using selected size and color first, then fallback in order
  const selectedVariant =
    variants.find(
      (v) =>
        (!selectedSize || getVariantSizeValue(v) === selectedSize) &&
        (selectedSubSize === null || getVariantSubSizeValue(v) === String(selectedSubSize).trim()) &&
        (!selectedColor || String(v.color || '').toLowerCase() === String(selectedColor).toLowerCase())
    ) ||
    variants.find(
      (v) =>
        (!selectedSize || getVariantSizeValue(v) === selectedSize) &&
        (selectedSubSize === null || getVariantSubSizeValue(v) === String(selectedSubSize).trim())
    ) ||
    variants.find((v) => (!selectedSize || getVariantSizeValue(v) === selectedSize)) ||
    variants.find((v) => (!selectedColor || String(v.color || '').toLowerCase() === String(selectedColor).toLowerCase())) ||
    variants[0] ||
    null;

  const selectedSizeLabel = useMemo(() => {
    if (!selectedVariant) return '';
    const parsed = parseVariantSize(selectedVariant);
    return [parsed.size_value, parsed.size_unit, parsed.size_info].filter(Boolean).join(' ').trim();
  }, [selectedVariant]);

  useEffect(() => {
    if (sizeGroups.length === 0) {
      if (selectedSize !== null) setSelectedSize(null);
      if (selectedSubSize !== null) setSelectedSubSize(null);
      return;
    }

    if (!selectedSizeGroup) {
      const firstGroup = sizeGroups[0];
      setSelectedSize(firstGroup.size_value);
      setSelectedSubSize(firstGroup.sub_options[0]?.value || null);
      return;
    }

    const isSubSizeValid = selectedSubOptions.some((option) => option.value === selectedSubSize);
    if (!isSubSizeValid) {
      setSelectedSubSize(selectedSubOptions[0]?.value || null);
    }
  }, [sizeGroups, selectedSizeGroup, selectedSubOptions, selectedSize, selectedSubSize]);

  const getAvailableColors = (size, subSize) => {
    const normalizedSubSize = subSize === null || subSize === undefined ? null : String(subSize).trim();
    const filtered = variants.filter((v) => {
      if (size && getVariantSizeValue(v) !== size) return false;
      if (normalizedSubSize !== null && getVariantSubSizeValue(v) !== normalizedSubSize) return false;
      return true;
    });
    return [...new Set(filtered.map((v) => v.color).filter(Boolean))];
  };

  // Keep available colors in sync with selected size.
  // If selected color becomes invalid for the size, pick first valid color.
  useEffect(() => {
    const colors = getAvailableColors(selectedSize, selectedSubSize);
    setFilteredColors(colors);

    if (colors.length === 0) {
      if (selectedColor !== null) setSelectedColor(null);
      return;
    }

    if (!selectedColor || !colors.includes(selectedColor)) {
      setSelectedColor(colors[0]);
    }
  }, [selectedSize, selectedSubSize, variants, selectedColor]);

  // Reset quantity back to 1 whenever variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

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
    // Don't attempt to fetch design gallery until we have product id, color,
    // and a concrete selected variant id.
    if (!id || !selectedColor || !selectedVariant?.id) {
      if (designGalleryImages.length !== 0) setDesignGalleryImages([]);
      if (designGalleryVideo !== null) setDesignGalleryVideo(null);
      return;
    }

    const loadDesignGallery = async () => {
      const variantId = selectedVariant.id;
      const url = `${API_ORIGIN}/api/design-gallery/${encodeURIComponent(id)}/${encodeURIComponent(selectedColor)}?variant_id=${encodeURIComponent(variantId)}`;

      // Dedupe requests using cache. Store either resolved data or a pending promise.
      const cache = designGalleryCacheRef.current;
      if (cache.has(url)) {
        const cached = await cache.get(url);
        setDesignGalleryImages(Array.isArray(cached?.images) ? cached.images : []);
        setDesignGalleryVideo(cached?.video_url || null);
        return;
      }

      const pending = (async () => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            // Normalize to object with images & video_url
            const normalized = { images: Array.isArray(data?.images) ? data.images : [], video_url: data?.video_url || null };
            cache.set(url, Promise.resolve(normalized));
            return normalized;
          }

          // On 404 or other non-ok, cache empty result (so we don't hammer server)
          const empty = { images: [], video_url: null };
          cache.set(url, Promise.resolve(empty));
          return empty;
        } catch (err) {
          const empty = { images: [], video_url: null };
          cache.set(url, Promise.resolve(empty));
          return empty;
        }
      })();

      // store pending promise immediately to dedupe concurrent callers
      cache.set(url, pending);
      const result = await pending;
      setDesignGalleryImages(result.images);
      setDesignGalleryVideo(result.video_url);
    };

    loadDesignGallery();
  }, [id, selectedColor, selectedVariant?.id]);

  const getVariantColorImage = (colorName) => {
    const normalized = String(colorName || '').toLowerCase();
    const sizeMatched = variants.find(
      (v) =>
        (!selectedSize || getVariantSizeValue(v) === selectedSize) &&
        (selectedSubSize === null || getVariantSubSizeValue(v) === String(selectedSubSize).trim()) &&
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
    if (!id || filteredColors.length === 0 || !variants || variants.length === 0) {
      if (Object.keys(colorThumbnails).length !== 0) setColorThumbnails({});
      return;
    }

    let isCancelled = false;

    const loadColorThumbnails = async () => {
      const entries = await Promise.all(
        filteredColors.map(async (color) => {
          let thumbnail = '';

          // Try variant-specific gallery first when a concrete variant id exists.
          const variantForColor = variants.find(
            (v) => String(v.color || '').toLowerCase() === String(color).toLowerCase()
          );

          if (variantForColor?.id) {
            try {
              const url = `${API_ORIGIN}/api/design-gallery/${encodeURIComponent(id)}/${encodeURIComponent(color)}?variant_id=${encodeURIComponent(variantForColor.id)}`;
              const cache = designGalleryCacheRef.current;
              if (cache.has(url)) {
                const cached = await cache.get(url);
                if (Array.isArray(cached?.images) && cached.images.length > 0) thumbnail = cached.images[0];
              } else {
                // fetch and cache
                const pending = (async () => {
                  try {
                    const res = await fetch(url);
                    if (res.ok) {
                      const data = await res.json();
                      const normalized = { images: Array.isArray(data?.images) ? data.images : [], video_url: data?.video_url || null };
                      cache.set(url, Promise.resolve(normalized));
                      return normalized;
                    }
                    const empty = { images: [], video_url: null };
                    cache.set(url, Promise.resolve(empty));
                    return empty;
                  } catch (err) {
                    const empty = { images: [], video_url: null };
                    cache.set(url, Promise.resolve(empty));
                    return empty;
                  }
                })();

                cache.set(url, pending);
                const data = await pending;
                if (Array.isArray(data?.images) && data.images.length > 0) thumbnail = data.images[0];
              }
            } catch {
              // Fall back to variant image below.
            }
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
      if (selectedVariant?.image) {
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
  }, [product, selectedVariant?.image, designGalleryImages, designGalleryVideo]);




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


  // Unique main-size keys for selector
  const uniqueSizes = sizeGroups.map((group) => group.size_value);

  const resolveVariantToAdd = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return null;
    }

    const variantToAdd =
      variants.find(
        (v) =>
          getVariantSizeValue(v) === selectedSize &&
          (selectedSubSize === null || getVariantSubSizeValue(v) === String(selectedSubSize).trim()) &&
          String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
      ) ||
      variants.find(
        (v) =>
          getVariantSizeValue(v) === selectedSize &&
          (selectedSubSize === null || getVariantSubSizeValue(v) === String(selectedSubSize).trim())
      ) ||
      variants.find((v) => getVariantSizeValue(v) === selectedSize) ||
      selectedVariant;

    if (!variantToAdd?.id) {
      toast.error("Please select a size");
      return null;
    }

    return variantToAdd;
  };

  const handleAddToCart = () => {
    const variantToAdd = resolveVariantToAdd();
    if (!variantToAdd) return;
    addToCart(product, variantToAdd, quantity);
  };

  const handleBuyNow = () => {
    const variantToAdd = resolveVariantToAdd();
    if (!variantToAdd) return;

    const normalizedSize = getVariantSizeValue(variantToAdd) || variantToAdd.size || null;
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
      quantity: quantity,
    };

    const nextCartItems = existsInCart ? cartItems : [...cartItems, nextCartItem];
    const nextTotal = nextCartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
    const platformFee = 250;
    const memberDiscount = -5000;
    const nextGrandTotal = nextTotal + platformFee + memberDiscount;

    addToCart(product, variantToAdd, quantity);
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
          <div className="product-detail-breadcrumb-wrap">
            <nav className="product-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="product-detail-breadcrumb-link">
                Home
              </Link>

              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <ChevronRight className="product-detail-breadcrumb-separator" size={12} strokeWidth={2.5} aria-hidden="true" />
                  {item.isLast ? (
                    <span className="product-detail-breadcrumb-current">{item.label}</span>
                  ) : (
                    <Link to={item.to} className="product-detail-breadcrumb-link">
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}

              {product?.name && (
                <>
                  <ChevronRight className="product-detail-breadcrumb-separator" size={12} strokeWidth={2.5} aria-hidden="true" />
                  <span className="product-detail-breadcrumb-current product-detail-breadcrumb-current--product" title={product.name}>
                    {product.name}
                  </span>
                </>
              )}
            </nav>
          </div>

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
                      gap: '8px',
                      width: '80px',
                      flexShrink: 0,
                      alignSelf: 'stretch',
                      justifyContent: 'space-between',
                      padding: '0',
                    }}>
                      {galleryItems.slice(0, 5).map((item, idx) => {
                        const isLastItem = idx === 4 && galleryItems.length > 5;
                        const isActive = selectedThumbnailIndex === idx;
                        const remainingCount = galleryItems.length - 4;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (isLastItem) {
                                // 5th thumbnail with '+X' overlay: open fullscreen modal
                                setCurrentModalIndex(4); // Start from 5th item
                                setIsLightboxOpen(true);
                              } else {
                                // Regular thumbnails: select normally
                                setCurrentImageIndex(idx);
                                setSelectedThumbnailIndex(idx);
                              }
                            }}
                            style={{
                              position: 'relative',
                              width: '80px',
                              aspectRatio: '1/1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isActive ? '3px solid #e33170' : '2px solid #d7d3d3ff',
                              cursor: 'pointer',
                              backgroundColor: '#f9fafb',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flex: '1 1 auto',
                              minHeight: '0'
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
                                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
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
                  <div className="product-detail-main-display" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: '0' }}>
                    <div className="product-detail-main-media-box"
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'default', flex: 1, width: '100%', minHeight: '0' }}
                    >
                      {/* Floating Share + Wishlist Buttons */}
                      <button
                        className="pdp-floating-share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = window.location.href;
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url).then(() => {
                              try { toast.success('Link Copied!'); } catch (e) { }
                            }).catch(() => {
                              try { toast.error('Failed to copy'); } catch (e) { }
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
                              try { toast.success('Link Copied!'); } catch (e) { }
                            } catch (err) {
                              try { toast.error('Failed to copy'); } catch (e) { }
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
                            muted
                            preload="metadata"
                            controlsList="nodownload nofullscreen noplaybackrate"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
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
                    </div>
                  </div>

                </div>
              </div>
              {/* Right: Details & Actions */}
              <div className="product-detail-info-col flex flex-col gap-6">
                <div className="product-detail-header-stack flex flex-col gap-0">
                  <h2 className="product-detail-title text-4xl font-bold text-gray-900 leading-tight mb-[12px]">{product.name}</h2>

                  {/* Ratings & Sales row */}
                  <div className="product-detail-rating-row flex flex-row items-center gap-2 flex-nowrap text-sm text-gray-600 mt-1 whitespace-nowrap overflow-hidden">
                    {(() => {
                      const rawRating = Number(product?.rating) || 0;
                      const rating = rawRating > 0 ? rawRating : 4.6;
                      const reviewCount = product?.reviewCount ?? '328';
                      const soldCount = product?.soldCount ?? '10K+';
                      const filled = Math.round(rating);

                      return (
                        <>
                          <div className="product-detail-stars flex items-center gap-0.5 shrink-0" aria-hidden>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={i < filled ? 'product-detail-star-filled' : 'product-detail-star-empty'}
                                fill={i < filled ? 'currentColor' : 'none'}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>

                          <span className="product-detail-rating-number font-medium text-gray-700">{rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}</span>

                          <span className="product-detail-review-count text-gray-500">({reviewCount} reviews)</span>

                          <span className="product-detail-vertical-sep w-[1px] h-3 bg-gray-300 mx-1 shrink-0" aria-hidden></span>

                          <span className="product-detail-sold text-gray-500">{soldCount} sold</span>
                        </>
                      );
                    })()}
                  </div>
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
                {sizeGroups.length > 0 && (
                  <div className="product-detail-size-selector" aria-label="Size variants">
                    <p className="product-detail-size-label">
                      <span className="product-detail-size-label-text">Selected size:</span>
                      <span className="product-detail-size-label-value">{selectedSizeLabel || '-'}</span>
                    </p>
                    <div className="size-chips">
                      {sizeGroups.map((group) => {
                        const size = group.size_value;
                        const sizeVariant = group.items.find(
                          (v) => String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
                        ) || group.items[0];
                        const isOOS = !sizeVariant || sizeVariant.stock === 0;
                        const buttonLabel = String(size || '').trim();
                        return (
                          <button
                            key={size}
                            className={`size-chip${selectedSize === size ? ' selected' : ''}${isOOS ? ' oos' : ''}`}
                            onClick={() => {
                              if (isOOS) return;
                              setSelectedSize(size);
                              setSelectedSubSize(group.sub_options[0]?.value || null);
                            }}
                            disabled={isOOS}
                            title={isOOS ? 'Out of Stock' : buttonLabel}
                          >
                            {buttonLabel}
                          </button>
                        );
                      })}
                    </div>

                    {hasMultipleSubSizes && (
                      <div className="product-detail-sub-size-selector" aria-label="Sub-size variants">
                        <p className="product-detail-size-label">
                          <span className="product-detail-size-label-text">
                            Selected {selectedSubOption?.variety || selectedSizeGroup?.variety || 'option'}:
                          </span>
                          <span className="product-detail-size-label-value">{selectedSubOption?.label || '-'}</span>
                        </p>
                        <div className="size-chips">
                          {visibleSubOptions.map((option) => {
                            const isActive = (selectedSubOption?.value || null) === option.value;
                            const optionVariant = option.items.find(
                              (v) => String(v.color || '').toLowerCase() === String(selectedColor || '').toLowerCase()
                            ) || option.items[0];
                            const isOOS = !optionVariant || optionVariant.stock === 0;
                            const buttonLabel = [option.value, option.sub_size_unit].filter(Boolean).join(' ').trim();

                            return (
                              <button
                                key={`${selectedSizeGroup?.size_value}-${option.value}`}
                                className={`size-chip${isActive ? ' selected' : ''}${isOOS ? ' oos' : ''}`}
                                onClick={() => !isOOS && setSelectedSubSize(option.value || null)}
                                disabled={isOOS}
                                title={isOOS ? 'Out of Stock' : buttonLabel}
                              >
                                {buttonLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                        Rs. {computedFinalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>

                      {hasDiscount && (
                        <>
                          <span style={{ fontSize: '1.125rem', textDecoration: 'line-through', color: '#9ca3af', fontWeight: 500 }}>
                            Rs. {basePrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                          <span style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transform: 'translateY(-2px)'
                          }}>
                            {String(discTypeStr).toLowerCase() === 'percentage' ? `${rawDiscVal}% OFF` : `Rs.${rawDiscVal} OFF`}
                          </span>
                        </>
                      )}
                    </div>

                    {hasDiscount && (
                      <div style={{ color: '#28a745', fontSize: '0.82rem', fontWeight: 600, marginTop: 0 }}>
                        You save Rs. {savingsVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>
                    )}

                    <span className="product-detail-tax" style={{ display: 'block', marginTop: hasDiscount ? 2 : 4 }}>All taxes included</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="product-detail-quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#374151' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '40px', background: '#fff' }}>
                      <button
                        type="button"
                        className="product-detail-quantity-btn"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1 || stockCount === 0}
                        style={{
                          width: '40px',
                          height: '100%',
                          border: 'none',
                          background: (quantity <= 1 || stockCount === 0) ? '#f9fafb' : '#fff',
                          color: (quantity <= 1 || stockCount === 0) ? '#9ca3af' : '#374151',
                          cursor: (quantity <= 1 || stockCount === 0) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 500,
                          padding: 0,
                          transition: 'none'
                        }}
                      >
                        &minus;
                      </button>
                      <span style={{
                        minWidth: '40px',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#111827',
                        borderLeft: '1.5px solid #e5e7eb',
                        borderRight: '1.5px solid #e5e7eb',
                        padding: '0 12px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fff'
                      }}>
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="product-detail-quantity-btn"
                        onClick={() => setQuantity(prev => Math.min(stockCount, prev + 1))}
                        disabled={quantity >= stockCount || stockCount === 0}
                        style={{
                          width: '40px',
                          height: '100%',
                          border: 'none',
                          background: (quantity >= stockCount || stockCount === 0) ? '#f9fafb' : '#fff',
                          color: (quantity >= stockCount || stockCount === 0) ? '#9ca3af' : '#374151',
                          cursor: (quantity >= stockCount || stockCount === 0) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 500,
                          padding: 0,
                          transition: 'none'
                        }}
                      >
                        &#43;
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="product-card-actions detail-page-buttons">
                    <button className="btn-card-add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
                    <button className="btn-card-buy-now" onClick={handleBuyNow} disabled={isRedirectingToCheckout}>
                      {isRedirectingToCheckout ? 'Redirecting to checkout...' : 'Buy Now'}
                    </button>
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

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="pdp-fullscreen-lightbox-backdrop">
          <div className="pdp-fullscreen-lightbox-container">
            {/* Close Button */}
            <button
              className="pdp-lightbox-close-btn"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Left Navigation Arrow */}
            <button
              className="pdp-lightbox-nav-btn pdp-lightbox-nav-prev"
              onClick={() => {
                setCurrentModalIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
              }}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Main Media Display */}
            <div className="pdp-lightbox-media-wrapper">
              {galleryItems[currentModalIndex]?.type === 'video' ? (
                <video
                  src={galleryItems[currentModalIndex]?.url}
                  controls
                  autoPlay
                  muted
                  className="pdp-lightbox-media"
                  controlsList="nodownload nofullscreen noplaybackrate"
                />
              ) : (
                <img
                  src={galleryItems[currentModalIndex]?.url}
                  alt={`Gallery item ${currentModalIndex + 1}`}
                  className="pdp-lightbox-media"
                />
              )}
            </div>

            {/* Right Navigation Arrow */}
            <button
              className="pdp-lightbox-nav-btn pdp-lightbox-nav-next"
              onClick={() => {
                setCurrentModalIndex((prev) => (prev + 1) % galleryItems.length);
              }}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Counter/Indicator */}
            <div className="pdp-lightbox-counter">
              {currentModalIndex + 1} / {galleryItems.length}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ProductDetail;

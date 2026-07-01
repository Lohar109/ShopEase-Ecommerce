import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigationType } from "react-router-dom";
import {
  BedDouble,
  BookOpen,
  Dice5,
  Dumbbell,
  Footprints,
  Monitor,
  Package,
  SearchX,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Award,
  Store,
  Volleyball,
  Watch,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Star,
  ShieldCheck,
  Check,
  Grid,
  List,
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import CategorySkeleton from "../components/CategorySkeleton";
import "../styles.css";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const CATEGORY_ICON_MAP = {
  electronics: Monitor,
  fashion: Shirt,
  home: Sofa,
  sports: Volleyball,
  beauty: Sparkles,
  books: BookOpen,
  toys: Dice5,
  mobiles: Smartphone,
  shoes: Footprints,
  groceries: ShoppingBasket,
  furniture: BedDouble,
  watches: Watch
};

const getCategoryIcon = (name) => {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();

  if (CATEGORY_ICON_MAP[normalized]) {
    return CATEGORY_ICON_MAP[normalized];
  }

  if (normalized.includes("elect")) return Monitor;
  if (normalized.includes("fashion") || normalized.includes("cloth")) return Shirt;
  if (normalized.includes("furnit")) return BedDouble;
  if (normalized.includes("toy")) return Dice5;
  if (normalized.includes("book")) return BookOpen;
  if (normalized.includes("beaut")) return Sparkles;
  if (normalized.includes("grocery")) return ShoppingBasket;
  if (normalized.includes("shoe")) return Footprints;
  if (normalized.includes("watch")) return Watch;
  if (normalized.includes("mobile") || normalized.includes("phone")) return Smartphone;
  if (normalized.includes("sport")) return Dumbbell;
  if (normalized.includes("home")) return Sofa;

  return Package;
};

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const SUBCATEGORY_HERO_CONTENT = {
  watches: {
    description: "Timeless designs for every style and occasion. Explore our wide range of premium watches.",
    badges: ["100% Original", "Best Prices", "2 Year Warranty", "Easy Returns"]
  },
  "men's fashion": {
    description: "Upgrade your wardrobe with our premium collection of men's clothing, footwear, and accessories.",
    badges: ["Top Quality", "Best Deals", "Easy Exchanges", "Free Shipping"]
  },
  "women's fashion": {
    description: "Discover elegant clothing, bags, shoes, and jewelry tailored for the modern woman.",
    badges: ["Top Quality", "Best Deals", "Easy Exchanges", "Free Shipping"]
  },
  electronics: {
    description: "Cutting-edge tech, top-tier audio, high-performance computers, and computing gear.",
    badges: ["100% Original", "Best Prices", "Brand Warranty", "Easy Returns"]
  }
};

const getHeroContent = (name) => {
  const normalized = String(name || "").trim().toLowerCase();
  if (SUBCATEGORY_HERO_CONTENT[normalized]) {
    return SUBCATEGORY_HERO_CONTENT[normalized];
  }
  return {
    description: `Explore our wide range of premium products in ${name || "this category"}. Quality guaranteed.`,
    badges: ["100% Original", "Best Prices", "Easy Returns", "Secure Checkout"]
  };
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState("grid");
  const [isSizeExpanded, setIsSizeExpanded] = useState(false);
  const [isColorExpanded, setIsColorExpanded] = useState(false);
  const [isRatingExpanded, setIsRatingExpanded] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navType = useNavigationType();

  // 1. Scroll event listener to track and save current scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      sessionStorage.setItem(
        `scroll_${window.location.pathname}${window.location.search}`,
        String(window.scrollY)
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading]);

  // 2. Restore scroll position when products finish loading (Only on POP navigation)
  useEffect(() => {
    if (!isLoading && products.length > 0 && navType === "POP") {
      const savedScroll = sessionStorage.getItem(
        `scroll_${window.location.pathname}${window.location.search}`
      );
      if (savedScroll) {
        const parsedScroll = parseInt(savedScroll, 10);
        if (!isNaN(parsedScroll) && parsedScroll > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({
              top: parsedScroll,
              behavior: "instant"
            });
          }, 60);
          return () => clearTimeout(timer);
        }
      }
    } else if (navType === "PUSH") {
      sessionStorage.removeItem(
        `scroll_${window.location.pathname}${window.location.search}`
      );
    }
  }, [isLoading, products, navType]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setIsCategoriesLoading(false));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_ORIGIN}/api/products?t=${Date.now()}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }

        const activeProducts = data.filter(
          (product) => product?.is_active === true || product?.active === true
        );

        setProducts(activeProducts);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const mainCategories = useMemo(
    () => categories.filter((category) => category?.parent_id === null),
    [categories]
  );

  const subcategoriesByParent = useMemo(() => {
    const grouped = {};
    categories.forEach((category) => {
      if (!category?.parent_id) return;
      if (!grouped[category.parent_id]) grouped[category.parent_id] = [];
      grouped[category.parent_id].push(category);
    });
    return grouped;
  }, [categories]);

  const categoryById = useMemo(() => {
    const index = {};
    categories.forEach((category) => {
      if (category?.id) index[String(category.id)] = category;
    });
    return index;
  }, [categories]);

  const activeSubcategories = selectedCategory
    ? subcategoriesByParent[selectedCategory] || []
    : [];

  useEffect(() => {
    const requestedCategory = normalizeCategoryKey(searchParams.get("category"));
    const requestedSubcategory = normalizeCategoryKey(searchParams.get("subcategory"));
    if (categories.length === 0) return;

    const matchesRequestedName = (category, requestedName) => {
      const nameKey = normalizeCategoryKey(category?.name);
      if (!nameKey || !requestedName) return false;

      return (
        nameKey === requestedName ||
        nameKey.startsWith(requestedName) ||
        requestedName.startsWith(nameKey)
      );
    };

    const matchedCategory = requestedCategory
      ? categories.find((category) => matchesRequestedName(category, requestedCategory))
      : null;
    const matchedSubcategory = requestedSubcategory
      ? categories.find((category) => matchesRequestedName(category, requestedSubcategory))
      : null;

    if (matchedSubcategory?.id) {
      const parentId = matchedCategory?.id || matchedSubcategory.parent_id || null;
      setSelectedCategory(parentId);
      setSelectedSubcategory(matchedSubcategory.id);
      return;
    }

    if (matchedCategory?.id) {
      const isTopLevelCategory = mainCategories.some((category) => String(category.id) === String(matchedCategory.id));

      if (isTopLevelCategory) {
        setSelectedCategory(matchedCategory.id);
        setSelectedSubcategory(null);
        return;
      }

      setSelectedCategory(matchedCategory.parent_id || null);
      setSelectedSubcategory(matchedCategory.id);
      return;
    }

    if (requestedSubcategory) {
      const subcategoryOnlyMatch = categories.find((category) => matchesRequestedName(category, requestedSubcategory));
      if (subcategoryOnlyMatch?.id) {
        setSelectedCategory(subcategoryOnlyMatch.parent_id || null);
        setSelectedSubcategory(subcategoryOnlyMatch.id);
      }
      return;
    }

    if (requestedCategory) {
      const topLevelMatch = mainCategories.find((category) => matchesRequestedName(category, requestedCategory));
      if (topLevelMatch?.id) {
        setSelectedCategory(topLevelMatch.id);
        setSelectedSubcategory(null);
      }
    }
  }, [searchParams, mainCategories, categories]);

  useEffect(() => {
    const requestedSubSub = normalizeCategoryKey(searchParams.get("subsubcategory"));
    if (categories.length === 0 || !selectedSubcategory) {
      setSelectedSubSubcategory(null);
      return;
    }
    const matched = categories.find(c => 
      String(c.parent_id) === String(selectedSubcategory) && 
      normalizeCategoryKey(c.name) === requestedSubSub
    );
    setSelectedSubSubcategory(matched ? matched.id : null);
  }, [searchParams, selectedSubcategory, categories]);

  const getProductPrice = (product) => {
    const firstVariant = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants[0] : null;
    const basePrice = firstVariant ? Number(firstVariant.price || 0) : 0;
    const discountValue = firstVariant ? Number(firstVariant.discount_value) || 0 : 0;
    const discountType = firstVariant ? String(firstVariant.discount_type || 'Percentage').toLowerCase() : 'percentage';
    
    if (discountValue > 0) {
      if (discountType === 'percentage') {
        return basePrice - (basePrice * (discountValue / 100));
      } else {
        return basePrice - discountValue;
      }
    }
    return basePrice;
  };

  const brandCounts = useMemo(() => {
    const counts = {};
    const activeLevelId = selectedSubcategory || selectedCategory;
    if (!activeLevelId) return counts;

    // Filter products within the active category level
    const subcategoryProducts = products.filter((product) => {
      let currentId = String(product?.category_id || "");
      while (currentId) {
        if (currentId === String(activeLevelId)) return true;
        const currentCategory = categoryById[currentId];
        currentId = currentCategory?.parent_id ? String(currentCategory.parent_id) : null;
      }
      return false;
    });

    subcategoryProducts.forEach((product) => {
      const b = product.brand ? String(product.brand).trim() : "Generic";
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [products, selectedCategory, selectedSubcategory, categoryById]);

  const getFilteredProducts = () => {
    if (!selectedCategory) return products;

    const checkMatch = (product, targetCatId) => {
      let currentId = String(product?.category_id || "");
      while (currentId) {
        if (currentId === String(targetCatId)) return true;
        const currentCategory = categoryById[currentId];
        currentId = currentCategory?.parent_id ? String(currentCategory.parent_id) : null;
      }
      return false;
    };

    const activeCatId = selectedSubcategory || selectedCategory;
    return products.filter((product) => checkMatch(product, activeCatId));
  };

  const getFilteredAndSortedProducts = () => {
    if (!selectedCategory) return products;

    // 1. Filter by category levels
    let list = [];
    if (selectedSubSubcategory) {
      list = products.filter((product) => String(product.category_id) === String(selectedSubSubcategory));
    } else {
      list = getFilteredProducts();
    }

    // 2. Filter by Price Range
    list = list.filter((product) => {
      const price = getProductPrice(product);
      return price >= minPrice && price <= maxPrice;
    });

    // 3. Filter by Brand
    if (selectedBrands.length > 0) {
      list = list.filter((product) => {
        const b = product.brand ? String(product.brand).trim() : "Generic";
        return selectedBrands.includes(b);
      });
    }

    // 4. Sort products
    if (sortBy === "price-low") {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  };

  const visibleProducts = getFilteredAndSortedProducts();

  const handleClearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(50000);
    setSelectedBrands([]);
    setSelectedSubSubcategory(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedRatings([]);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("subsubcategory");
    setSearchParams(nextParams);
  };

  const childList = selectedSubcategory 
    ? (subcategoriesByParent[selectedSubcategory] || [])
    : (subcategoriesByParent[selectedCategory] || []);

  const isCategoryActive = selectedCategory !== null;

  // Render the redesigned subcategory page if it has sub-subcategories or is a main category page
  if (isCategoryActive) {
    const currentCategoryObj = categoryById[selectedCategory];
    const currentSubcategoryObj = selectedSubcategory ? categoryById[selectedSubcategory] : null;
    const activeMainObj = currentSubcategoryObj || currentCategoryObj;
    const heroContent = getHeroContent(activeMainObj?.name);
    const heroImage = activeMainObj?.image || `/category-icons/${activeMainObj?.name}.png`;

    // Recursive helper to count products in category & descendants
    const getRecursiveProductCount = (catId) => {
      const checkMatch = (product, targetCatId) => {
        let currentId = String(product?.category_id || "");
        while (currentId) {
          if (currentId === String(targetCatId)) return true;
          const currentCategory = categoryById[currentId];
          currentId = currentCategory?.parent_id ? String(currentCategory.parent_id) : null;
        }
        return false;
      };
      return products.filter(p => checkMatch(p, catId)).length;
    };

    const totalProductCount = getRecursiveProductCount(activeMainObj?.id);

    return (
      <main className="shop-page subcategory-page-layout">
        <div className="max-w-7xl mx-auto px-4 w-full">
          {/* Breadcrumbs */}
          <div className="subcategory-breadcrumbs">
            <span className="breadcrumb-item" onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSelectedSubSubcategory(null); setSearchParams({}); }}>Home</span>
            <span className="breadcrumb-separator">&gt;</span>
            {currentSubcategoryObj ? (
              <>
                <span className="breadcrumb-item" onClick={() => { setSelectedSubcategory(null); setSelectedSubSubcategory(null); setSearchParams({ category: normalizeCategoryKey(currentCategoryObj?.name) }); }}>{currentCategoryObj?.name}</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-current">{currentSubcategoryObj?.name}</span>
              </>
            ) : (
              <span className="breadcrumb-current">{currentCategoryObj?.name}</span>
            )}
          </div>

          {/* Premium Category Header: Combined Welcome Info & Circles Carousel Box */}
          <div className="category-header-combined-box">
            <div className="category-info-card">
              <h1 className="info-card-title">{activeMainObj?.name}</h1>
              <p className="info-card-desc">{heroContent.description}</p>
              <div className="info-badges-row">
                <div className="info-badge">
                  <Package size={14} className="info-badge-icon" />
                  <span>{totalProductCount}+ Products</span>
                </div>
                <div className="info-badge">
                  <Award size={14} className="info-badge-icon" />
                  <span>Top Brands</span>
                </div>
                <div className="info-badge">
                  <Sparkles size={14} className="info-badge-icon" />
                  <span>Premium Quality</span>
                </div>
              </div>
            </div>

            {childList.length > 0 && (
              <div className="category-circles-carousel-wrapper">
                <div className="category-circles-carousel animate-marquee hover:[animation-play-state:paused]">
                  {Array.from({ length: 2 }).map((_, loopIndex) => (
                    <div
                      key={`sub-loop-${loopIndex}`}
                      className="category-circles-marquee-group"
                      aria-hidden={loopIndex === 1}
                    >
                      {childList.map((sub) => {
                        const isSelected = selectedSubcategory 
                          ? String(selectedSubSubcategory) === String(sub.id)
                          : false;
                        const displayName = sub.name.replace(/_/g, " ");
                        
                        return (
                          <button
                            key={`${loopIndex}-${sub.id}`}
                            type="button"
                            onClick={() => {
                              const nextParams = new URLSearchParams(searchParams);
                              if (selectedSubcategory) {
                                if (isSelected) {
                                  nextParams.delete("subsubcategory");
                                } else {
                                  nextParams.set("subsubcategory", normalizeCategoryKey(sub.name));
                                }
                              } else {
                                nextParams.set("subcategory", normalizeCategoryKey(sub.name));
                              }
                              setSearchParams(nextParams);
                            }}
                            className={`circle-carousel-item ${isSelected ? 'is-selected' : ''}`}
                          >
                            <div className="circle-img-wrap">
                              <img src={sub.image || `/category-icons/${sub.name}.png`} alt={displayName} />
                            </div>
                            <span className="circle-label">{displayName}</span>
                            {isSelected && <div className="circle-active-line" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Three-Column Split Layout */}
          <div className="category-three-col-layout">
            {/* Column 1: Filters Sidebar */}
            <aside className="filters-sidebar">
              <div className="sidebar-header">
                <h3>Filters</h3>
                <button className="clear-all-btn" onClick={handleClearAllFilters}>Clear All</button>
              </div>
              
              <div className="filter-section">
                <h4 className="filter-title">Price Range</h4>
                <div className="price-inputs-row">
                  <div className="price-input-box">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="price-input-box">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
                <div className="price-slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-slider-input"
                  />
                </div>
              </div>

              {childList.length > 0 && (
                <div className="filter-section">
                  <h4 className="filter-title">Category</h4>
                  <div className="brand-list-wrapper">
                    {childList.map((sub) => {
                      const isChecked = selectedSubcategory 
                        ? String(selectedSubSubcategory) === String(sub.id)
                        : false;
                      const displayName = sub.name.replace(/_/g, " ");
                      const count = getRecursiveProductCount(sub.id);
                      
                      return (
                        <label key={sub.id} className="brand-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const nextParams = new URLSearchParams(searchParams);
                              if (selectedSubcategory) {
                                if (isChecked) {
                                  nextParams.delete("subsubcategory");
                                } else {
                                  nextParams.set("subsubcategory", normalizeCategoryKey(sub.name));
                                }
                              } else {
                                nextParams.set("subcategory", normalizeCategoryKey(sub.name));
                              }
                              setSearchParams(nextParams);
                            }}
                          />
                          <span className="checkbox-custom-box">
                            {isChecked && <Check size={12} className="checkmark-icon" />}
                          </span>
                          <span className="brand-name-text">{displayName}</span>
                          <span className="brand-count-badge">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.keys(brandCounts).length > 0 && (
                <div className="filter-section">
                  <h4 className="filter-title">Brand</h4>
                  <div className="brand-list-wrapper">
                    {Object.entries(brandCounts).map(([brandName, count]) => {
                      const isChecked = selectedBrands.includes(brandName);
                      return (
                        <label key={brandName} className="brand-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedBrands(selectedBrands.filter(b => b !== brandName));
                              } else {
                                setSelectedBrands([...selectedBrands, brandName]);
                              }
                            }}
                          />
                          <span className="checkbox-custom-box">
                            {isChecked && <Check size={12} className="checkmark-icon" />}
                          </span>
                          <span className="brand-name-text">{brandName}</span>
                          <span className="brand-count-badge">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Accordion */}
              <div className="filter-section">
                <button 
                  type="button" 
                  className="filter-accordion-header"
                  onClick={() => setIsSizeExpanded(!isSizeExpanded)}
                >
                  <span className="filter-title">Size</span>
                  <span className="accordion-arrow">
                    {isSizeExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                {isSizeExpanded && (
                  <div className="filter-accordion-content brand-list-wrapper">
                    {["S", "M", "L", "XL", "XXL"].map((size) => {
                      const isChecked = selectedSizes.includes(size);
                      return (
                        <label key={size} className="brand-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedSizes(selectedSizes.filter(s => s !== size));
                              } else {
                                setSelectedSizes([...selectedSizes, size]);
                              }
                            }}
                          />
                          <span className="checkbox-custom-box">
                            {isChecked && <Check size={12} className="checkmark-icon" />}
                          </span>
                          <span className="brand-name-text">{size}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Color Accordion */}
              <div className="filter-section">
                <button 
                  type="button" 
                  className="filter-accordion-header"
                  onClick={() => setIsColorExpanded(!isColorExpanded)}
                >
                  <span className="filter-title">Color</span>
                  <span className="accordion-arrow">
                    {isColorExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                {isColorExpanded && (
                  <div className="filter-accordion-content brand-list-wrapper">
                    {["Black", "White", "Blue", "Red", "Grey"].map((color) => {
                      const isChecked = selectedColors.includes(color);
                      return (
                        <label key={color} className="brand-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedColors(selectedColors.filter(c => c !== color));
                              } else {
                                setSelectedColors([...selectedColors, color]);
                              }
                            }}
                          />
                          <span className="checkbox-custom-box">
                            {isChecked && <Check size={12} className="checkmark-icon" />}
                          </span>
                          <span className="brand-name-text">{color}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>


            </aside>

            {/* Column 2: Products Container */}
            <div className="products-layout-container">


              {isLoading ? (
                <div className="subcategory-product-grid skeleton-active three-cols">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <ProductSkeleton key={`sub-skeleton-${index}`} />
                  ))}
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="subcategory-empty-products">
                  <SearchX size={64} className="empty-icon" />
                  <h3>No products found matching your filters</h3>
                  <p>Try resetting the price range or brand filters.</p>
                  <button className="reset-filters-btn" onClick={handleClearAllFilters}>Reset Filters</button>
                </div>
              ) : (
                <>
                  <div className={`subcategory-product-grid three-cols ${viewMode === 'list' ? 'list-view-active' : ''}`}>
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Mock Pagination matches mockup exactly */}
                  <div className="pagination-container">
                    <button className="pagination-btn arrow-btn">&lt;</button>
                    <button className="pagination-btn is-active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <button className="pagination-btn">4</button>
                    <span className="pagination-ellipsis">...</span>
                    <button className="pagination-btn">30</button>
                    <button className="pagination-btn arrow-btn">&gt;</button>
                  </div>
                </>
              )}
            </div>

            {/* Column 3: Promo Sidebar */}
            <aside className="promo-sidebar">
              <div className="promo-banner-card">
                <div className="promo-text-wrap">
                  <span className="promo-kicker">New Season</span>
                  <h3 className="promo-title">New Style</h3>
                  <span className="promo-discount">Up to 50% Off</span>
                  <button type="button" className="promo-cta-btn" onClick={() => toast.success("Shopping new arrivals now...", { icon: "🛍️" })}>
                    SHOP NOW
                  </button>
                </div>
                <div className="promo-img-wrap">
                  <img src="/assets/fashion_promo_model.png" alt="Stylish model" className="promo-model-img" />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="promo-trust-badges">
                <div className="promo-trust-badge-item">
                  <div className="trust-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="trust-badge-text">
                    <strong>100% Original</strong>
                    <span>Products</span>
                  </div>
                </div>

                <div className="promo-trust-badge-item">
                  <div className="trust-icon-box">
                    <Package size={18} />
                  </div>
                  <div className="trust-badge-text">
                    <strong>Easy Returns</strong>
                    <span>&amp; Refunds</span>
                  </div>
                </div>

                <div className="promo-trust-badge-item">
                  <div className="trust-icon-box">
                    <Store size={18} />
                  </div>
                  <div className="trust-badge-text">
                    <strong>Fast Delivery</strong>
                    <span>Pan India</span>
                  </div>
                </div>

                <div className="promo-trust-badge-item">
                  <div className="trust-icon-box">
                    <Award size={18} />
                  </div>
                  <div className="trust-badge-text">
                    <strong>Secure Payment</strong>
                    <span>100% Safe</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shop-page">
      {/* Category filter section removed per user request */}

      {!isLoading && selectedCategory && activeSubcategories.length > 0 && (
        <div className="shop-subcategory-nav-wrap">
          <div className="shop-subcategory-nav-shell">
            <div className="shop-subcategory-marquee-viewport" role="navigation" aria-label="Subcategory navigation">
              <div className="shop-subcategory-primary-row animate-marquee hover:[animation-play-state:paused]">
                {Array.from({ length: 2 }).map((_, loopIndex) => (
                  <div
                    key={`subcategory-loop-${loopIndex}`}
                    className="shop-subcategory-marquee-group"
                    aria-hidden={loopIndex === 1}
                  >
                    {activeSubcategories.map((sub) => {
                      const isSelected = selectedSubcategory === sub.id;
                      return (
                        <button
                          key={`${loopIndex}-${sub.id}`}
                          type="button"
                          onClick={() => setSelectedSubcategory(isSelected ? null : sub.id)}
                          className={`shop-subcategory-card ${isSelected ? 'is-selected' : ''}`}
                          aria-pressed={isSelected}
                        >
                          <span className="shop-subcategory-card-media" aria-hidden="true">
                            <img
                              src={sub.image || `/category-icons/${sub.name}.png`}
                              alt=""
                              className="shop-subcategory-card-image"
                            />
                          </span>
                          <span className="shop-subcategory-card-label">{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="shop-product-grid max-w-7xl mx-auto px-4 w-full" aria-label="Products">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={`shop-skeleton-${index}`} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="shop-empty-results" role="status">
            <SearchX size={72} strokeWidth={1.6} className="shop-empty-results-icon" aria-hidden="true" />
            <h2>No products match your filters</h2>
            <p>Try removing one or more filters to view more products.</p>
            <button
              type="button"
              className="shop-clear-filters-btn"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;

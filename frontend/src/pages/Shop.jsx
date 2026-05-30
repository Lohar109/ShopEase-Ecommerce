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
  Store,
  Volleyball,
  Watch
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

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
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
        const response = await fetch(`${API_ORIGIN}/api/products`);
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

  const visibleProducts = getFilteredProducts();

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

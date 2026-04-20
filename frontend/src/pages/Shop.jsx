import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BedDouble,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
  const categoryScrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const scrollCategoryRail = (direction) => {
    const rail = categoryScrollRef.current;
    if (!rail) return;

    const distance = Math.max(220, Math.floor(rail.clientWidth * 0.6));
    rail.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth"
    });
  };

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

        const productsWithVariants = await Promise.all(
          activeProducts.map(async (product) => {
            try {
              const detailsRes = await fetch(`${API_ORIGIN}/api/products/${product.id}`);
              const details = await detailsRes.json();
              return { ...product, variants: details.variants || [] };
            } catch {
              return { ...product, variants: [] };
            }
          })
        );

        setProducts(productsWithVariants);
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
    if (!requestedCategory || mainCategories.length === 0) return;

    const matchedCategory = mainCategories.find((category) => {
      const nameKey = normalizeCategoryKey(category?.name);
      if (!nameKey) return false;

      return (
        nameKey === requestedCategory ||
        nameKey.startsWith(requestedCategory) ||
        requestedCategory.startsWith(nameKey)
      );
    });

    if (matchedCategory?.id) {
      setSelectedCategory(matchedCategory.id);
      setSelectedSubcategory(null);
    }
  }, [searchParams, mainCategories]);

  const getFilteredProducts = () => {
    if (!selectedCategory) return products;

    if (selectedSubcategory) {
      return products.filter(
        (product) => String(product?.category_id) === String(selectedSubcategory)
      );
    }

    return products.filter((product) => {
      const productCategoryId = String(product?.category_id || "");
      const directMatch = productCategoryId === String(selectedCategory);
      const parentMatch =
        categoryById[productCategoryId] &&
        String(categoryById[productCategoryId].parent_id) === String(selectedCategory);

      return directMatch || parentMatch;
    });
  };

  const visibleProducts = getFilteredProducts();

  return (
    <main className="shop-page">
      <section className="shop-filter-card" aria-label="Filter by category">
        <div className="shop-filter-card-main">
          <h1 className="shop-page-title">Explore Our Collection</h1>

          <div className="shop-category-rail">
            <button
              type="button"
              className="shop-category-nav-btn"
              aria-label="Scroll categories left"
              onClick={() => scrollCategoryRail("left")}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>

            <div ref={categoryScrollRef} className="shop-category-scroll" role="list" aria-label="Category cards">
              {isCategoriesLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <CategorySkeleton key={`category-skeleton-${index}`} />
                ))
              ) : (
                <>
                  <button
                    type="button"
                    className={`shop-category-card ${!selectedCategory ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }}
                    aria-pressed={!selectedCategory}
                  >
                    <span className="shop-category-media shop-category-media-all" aria-hidden="true">
                      <Store size={24} strokeWidth={2} className="shop-category-icon" />
                    </span>
                    <span className="shop-category-divider" aria-hidden="true" />
                    <span className="shop-category-name whitespace-nowrap">All</span>
                  </button>

                  {mainCategories.map((category) => {
                    const categoryName = category.name || "Category";
                    const CategoryIcon = getCategoryIcon(categoryName);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        className={`shop-category-card ${
                          String(selectedCategory) === String(category.id) ? "active" : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory(null);
                        }}
                        aria-pressed={String(selectedCategory) === String(category.id)}
                      >
                        <span className="shop-category-media" aria-hidden="true">
                          <CategoryIcon size={24} strokeWidth={2} className="shop-category-icon" />
                        </span>
                        <span className="shop-category-divider" aria-hidden="true" />
                        <span className="shop-category-name whitespace-nowrap">{categoryName}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            <button
              type="button"
              className="shop-category-nav-btn"
              aria-label="Scroll categories right"
              onClick={() => scrollCategoryRail("right")}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {selectedCategory && activeSubcategories.length > 0 && (
          <div className="shop-pill-row shop-subcategory-row subcategory-row" aria-label="Filter by subcategory">
            {activeSubcategories.map((subcategory) => {
              const subcategoryName = subcategory.name || "Subcategory";
              const SubcategoryIcon = getCategoryIcon(subcategoryName);

              return (
                <button
                  key={subcategory.id}
                  type="button"
                  className={`shop-pill shop-sub-pill ${
                    String(selectedSubcategory) === String(subcategory.id) ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedSubcategory((prev) =>
                      String(prev) === String(subcategory.id) ? null : subcategory.id
                    );
                  }}
                >
                  <span className="shop-sub-pill-icon-wrap" aria-hidden="true">
                    <SubcategoryIcon size={14} strokeWidth={2} className="shop-sub-pill-icon" />
                  </span>
                  <span className="shop-sub-pill-divider" aria-hidden="true" />
                  <span>{subcategoryName}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="shop-product-grid" aria-label="Products">
        {!isLoading && (
          <div className="shop-results-meta" aria-live="polite">
            <span>Showing {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</span>
          </div>
        )}

        {isLoading ? (
          <div className="wishlist-products-grid">
            {Array.from({ length: 8 }).map((_, index) => (
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
          <div className="wishlist-products-grid">
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

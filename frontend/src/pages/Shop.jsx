import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const selectedCategoryData = selectedCategory ? categoryById[String(selectedCategory)] : null;

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
            <div className="shop-subcategory-nav-header">
              <div>
                <p className="shop-subcategory-nav-kicker">Subcategories</p>
                <h2 className="shop-subcategory-nav-title">
                  {selectedCategoryData?.name || 'Browse subcategories'}
                </h2>
              </div>
              <button
                type="button"
                className={`shop-subcategory-reset ${selectedSubcategory ? 'is-active' : ''}`}
                onClick={() => setSelectedSubcategory(null)}
              >
                All items
              </button>
            </div>

            <div className="shop-subcategory-row" role="navigation" aria-label="Subcategory navigation">
              {activeSubcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
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

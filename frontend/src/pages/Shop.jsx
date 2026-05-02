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

      {!isLoading && activeSubcategories.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', width: '100%' }}>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '24px', padding: '20px 4px 20px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {activeSubcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(isSelected ? null : sub.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '112px', cursor: 'pointer' }}
                >
                  {/* Pro card — matches product card aesthetic */}
                  <div style={{
                    width: '112px',
                    height: '112px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    border: isSelected ? '2px solid #e11d48' : '1px solid #f3f4f6',
                    boxShadow: isSelected
                      ? '0 6px 20px rgba(225,29,72,0.18)'
                      : '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    flexShrink: 0,
                    transition: 'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.18s ease',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxSizing: 'border-box',
                  }}>
                    <img
                      src={sub.image || `/category-icons/${sub.name}.png`}
                      alt={sub.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', flexShrink: 0 }}
                    />
                  </div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 500,
                    textAlign: 'center',
                    marginTop: '9px',
                    color: isSelected ? '#e11d48' : '#6b7280',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    maxWidth: '112px',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {sub.name}
                  </span>
                </div>
              );
            })}
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

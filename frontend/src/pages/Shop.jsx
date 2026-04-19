import React, { useEffect, useMemo, useState } from "react";
import { Package, Store } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import "../styles.css";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const getCategoryImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [imageLoadFailedById, setImageLoadFailedById] = useState({});

  const handleCategoryImageError = (categoryId) => {
    const key = String(categoryId);
    setImageLoadFailedById((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  };

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
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
      <section className="shop-page-header" aria-label="Shop page heading">
        <p className="shop-breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">&nbsp;&gt;&nbsp;</span>
          <span>Shop</span>
        </p>
        <h1 className="shop-page-title">Explore Our Collection</h1>
      </section>

      <section className="shop-categories" aria-label="Filter by category">
        <div className="shop-category-scroll" role="list" aria-label="Category cards">
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
              <Store size={28} strokeWidth={2} />
            </span>
            <span className="shop-category-name">All</span>
          </button>

          {mainCategories.map((category) => (
            (() => {
              const categoryName = category.name || "Category";
              const categoryImageSrc = getCategoryImageSrc(category.image || category.image_url);
              const imageFailed = imageLoadFailedById[String(category.id)];
              const showImage = Boolean(categoryImageSrc) && !imageFailed;

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
                    {showImage ? (
                      <img
                        src={categoryImageSrc}
                        alt={categoryName}
                        loading="lazy"
                        onError={() => handleCategoryImageError(category.id)}
                      />
                    ) : (
                      <span className="shop-category-icon-fallback" aria-hidden="true">
                        <Package size={22} strokeWidth={1.9} />
                      </span>
                    )}
                  </span>
                  <span className="shop-category-name">{categoryName}</span>
                </button>
              );
            })()
          ))}
        </div>

        {selectedCategory && activeSubcategories.length > 0 && (
          <div className="shop-pill-row subcategory-row" aria-label="Filter by subcategory">
            {activeSubcategories.map((subcategory) => (
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
                {subcategory.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="shop-product-grid" aria-label="Products">
        {isLoading ? (
          <div className="shop-products-grid-four">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`shop-skeleton-${index}`} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="shop-empty-products">No products found for this selection.</p>
        ) : (
          <div className="shop-products-grid-four">
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

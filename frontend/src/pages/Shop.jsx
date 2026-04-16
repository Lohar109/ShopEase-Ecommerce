import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import "../styles.css";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

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
      <section className="shop-categories" aria-label="Filter by category">
        <div className="shop-pill-row">
          <button
            type="button"
            className={`shop-pill ${!selectedCategory ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
          >
            All
          </button>

          {mainCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`shop-pill ${String(selectedCategory) === String(category.id) ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedSubcategory(null);
              }}
            >
              {category.name}
            </button>
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

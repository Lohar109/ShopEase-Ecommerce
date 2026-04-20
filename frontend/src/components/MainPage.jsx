import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dice1,
  Dice4,
  Footprints,
  Monitor,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Volleyball,
  Watch
} from "lucide-react";
import "../styles.css";
import HeroCarousel from "./HeroCarousel";
import CategorySkeleton from "./CategorySkeleton";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const CATEGORY_ITEMS = [
  { key: "electronics", label: "Electronics", icon: Monitor },
  { key: "fashion", label: "Fashion", icon: Shirt },
  { key: "home", label: "Home", icon: Sofa },
  { key: "sports", label: "Sports", icon: Volleyball },
  { key: "beauty", label: "Beauty", icon: Sparkles },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "toys", label: "Toys", icon: null },
  { key: "mobiles", label: "Mobiles", icon: Smartphone },
  { key: "shoes", label: "Shoes", icon: Footprints },
  { key: "groceries", label: "Groceries", icon: ShoppingBasket },
  { key: "furniture", label: "Furniture", icon: BedDouble },
  { key: "watches", label: "Watches", icon: Watch }
];

const HOME_CATEGORY_ICON_MAP = {
  electronics: Monitor,
  fashion: Shirt,
  home: Sofa,
  sports: Volleyball,
  beauty: Sparkles,
  books: BookOpen,
  toys: null,
  mobiles: Smartphone,
  shoes: Footprints,
  groceries: ShoppingBasket,
  furniture: BedDouble,
  watches: Watch
};

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const getHomeCategoryIcon = (name) => {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();

  if (HOME_CATEGORY_ICON_MAP[normalized] !== undefined) {
    return HOME_CATEGORY_ICON_MAP[normalized];
  }

  if (normalized.includes("elect")) return Monitor;
  if (normalized.includes("fashion") || normalized.includes("cloth")) return Shirt;
  if (normalized.includes("furnit")) return BedDouble;
  if (normalized.includes("toy")) return null;
  if (normalized.includes("book")) return BookOpen;
  if (normalized.includes("beaut")) return Sparkles;
  if (normalized.includes("grocery")) return ShoppingBasket;
  if (normalized.includes("shoe")) return Footprints;
  if (normalized.includes("watch")) return Watch;
  if (normalized.includes("mobile") || normalized.includes("phone")) return Smartphone;
  if (normalized.includes("sport")) return Volleyball;
  if (normalized.includes("home")) return Sofa;

  return Monitor;
};

const MainPage = () => {
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [homeCategories, setHomeCategories] = useState(CATEGORY_ITEMS);
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);

  const scrollHomeCategories = (direction) => {
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
      .then((data) => {
        if (!Array.isArray(data)) {
          setHomeCategories(CATEGORY_ITEMS);
          return;
        }

        const mappedMainCategories = data
          .filter((category) => category?.parent_id === null)
          .map((category) => {
            const label = String(category?.name || "Category").trim() || "Category";
            const key = normalizeCategoryKey(label) || String(category?.id || label);

            return {
              key,
              label,
              icon: getHomeCategoryIcon(label)
            };
          });

        setHomeCategories(mappedMainCategories.length > 0 ? mappedMainCategories : CATEGORY_ITEMS);
      })
      .catch(() => setHomeCategories(CATEGORY_ITEMS))
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
              const res = await fetch(`${API_ORIGIN}/api/products/${product.id}`);
              const details = await res.json();
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

  const safeProducts = Array.isArray(products) ? products : [];
  const visibleProducts = safeProducts.filter(
    (product) => product?.is_active === true || product?.active === true
  );

  return (
    <main>
      {/* Shop by Category Section */}
      <section className="categories" aria-label="Shop categories">
        <div className="home-categories-card">
          <h2 className="home-categories-title">Shop by Category</h2>

          <div className="home-category-rail">
            <button
              type="button"
              className="home-category-nav-btn"
              aria-label="Scroll categories left"
              onClick={() => scrollHomeCategories("left")}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>

            <div ref={categoryScrollRef} className="home-categories-scroll" role="list" aria-label="Category cards">
              {isCategoriesLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <CategorySkeleton key={`home-category-skeleton-${index}`} />
                ))
              ) : (
                homeCategories.map((category) => {
                  const isToysCategory = String(category.key).includes("toy");
                  const Icon = category.icon || Monitor;

                  return (
                    <a
                      key={category.key}
                      href={`/shop?category=${category.key}`}
                      className="home-category-link"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveCategoryKey(category.key);
                        navigate(`/shop?category=${category.key}`);
                      }}
                    >
                      <div className={`home-category-card ${activeCategoryKey === category.key ? "active" : ""}`}>
                        <span className="home-category-media" aria-hidden="true">
                          {isToysCategory ? (
                            <span className="home-category-icon home-category-dice-pair">
                              <Dice1 size={11} strokeWidth={2} className="home-category-die home-category-die-top" />
                              <Dice4 size={11} strokeWidth={2} className="home-category-die home-category-die-bottom" />
                            </span>
                          ) : (
                            <Icon size={18} strokeWidth={2} className="home-category-icon" />
                          )}
                        </span>
                        <span className="home-category-divider" aria-hidden="true" />
                        <span className="home-category-name">{category.label}</span>
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            <button
              type="button"
              className="home-category-nav-btn"
              aria-label="Scroll categories right"
              onClick={() => scrollHomeCategories("right")}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </section>

      <HeroCarousel />

      {/* Featured Products */}
      <section className="shop-product-grid" aria-label="Featured products">
        {isLoading ? (
          <div className="shop-products-grid-four">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`home-skeleton-${index}`} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="shop-empty-products">No products found.</p>
        ) : (
          <div className="shop-products-grid-four">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Site Footer */}
      <footer className="home-footer" aria-label="Footer navigation and company information">
        <div className="home-footer-top">
          <div className="home-footer-column">
            <h3>Shop</h3>
            <a href="/shop">All Products</a>
            <a href="/shop">Featured</a>
            <a href="/shop">New Arrivals</a>
            <a href="/shop">Discounts</a>
          </div>

          <div className="home-footer-column">
            <h3>Help &amp; Support</h3>
            <a href="#">Contact Us</a>
            <a href="#">Order Tracking</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Returns &amp; Exchanges</a>
          </div>

          <div className="home-footer-column">
            <h3>Company</h3>
            <a href="#">About ShopEase</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>

          <div className="home-footer-column">
            <h3>Connect</h3>
            <div className="home-footer-socials" aria-label="Social media links">
              <a href="#" className="home-footer-social-link" aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="footer-instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f58529" />
                      <stop offset="45%" stopColor="#dd2a7b" />
                      <stop offset="100%" stopColor="#8134af" />
                    </linearGradient>
                  </defs>
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="url(#footer-instagram-gradient)" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="17.2" cy="6.9" r="1.1" fill="#ffffff" />
                </svg>
              </a>
              <a href="#" className="home-footer-social-link" aria-label="X" title="X">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#ffffff" />
                  <path d="M17.62 4.5h2.35l-5.12 5.86L21 19.5h-4.76l-3.73-4.9-4.18 4.9H5.98l5.47-6.24L5.7 4.5h4.88l3.39 4.45 3.65-4.45z" fill="#0b0b0b" />
                </svg>
              </a>
              <a href="#" className="home-footer-social-link" aria-label="Facebook" title="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="9.5" fill="#1877f2" />
                  <path d="M13.26 19v-6.25h2.08l.33-2.41h-2.41V8.8c0-.7.2-1.17 1.19-1.17h1.27V5.46c-.22-.03-.97-.09-1.85-.09-1.83 0-3.08 1.12-3.08 3.16v1.8H8.72v2.41h2.07V19h2.47z" fill="#ffffff" />
                </svg>
              </a>
            </div>

            <div className="home-footer-payments" aria-label="Accepted payment methods">
              <p>Payment Methods</p>
              <div className="home-footer-payment-logos">
                <span className="home-footer-payment-logo" aria-label="Visa" title="Visa">
                  <svg viewBox="0 0 56 24" aria-hidden="true" focusable="false">
                    <rect x="0.75" y="0.75" width="54.5" height="22.5" rx="6" fill="#ffffff" stroke="#dbe5f5" />
                    <text x="12" y="16" fill="#1a1f71" fontSize="11" fontWeight="800" fontFamily="Poppins, sans-serif">VISA</text>
                    <path d="M12 18.2h18l-0.8 1.7H11.2z" fill="#f7b600" />
                  </svg>
                </span>
                <span className="home-footer-payment-logo" aria-label="Mastercard" title="Mastercard">
                  <svg viewBox="0 0 56 24" aria-hidden="true" focusable="false">
                    <rect x="0.75" y="0.75" width="54.5" height="22.5" rx="6" fill="#ffffff" stroke="#dbe5f5" />
                    <circle cx="24" cy="12" r="6.4" fill="#eb001b" />
                    <circle cx="32" cy="12" r="6.4" fill="#f79e1b" fillOpacity="0.95" />
                  </svg>
                </span>
                <span className="home-footer-payment-logo" aria-label="UPI" title="UPI">
                  <svg viewBox="0 0 96 28" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
                    <path d="M16.5 6.3 22.9 13.9 16.5 21.5" fill="none" stroke="#2b6df6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.8 6.3 27.2 13.9 20.8 21.5" fill="none" stroke="#f28b21" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="33" y="18.2" fill="#1f2937" fontSize="14" fontWeight="800" fontFamily="Poppins, sans-serif">UPI</text>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>&copy; 2026 ShopEase. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default MainPage;

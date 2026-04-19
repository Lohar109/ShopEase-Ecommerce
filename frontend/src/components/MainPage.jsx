import React, { useEffect, useState } from "react";
import {
  BedDouble,
  BookOpen,
  Dumbbell,
  Footprints,
  Monitor,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  ToyBrick,
  Watch
} from "lucide-react";
import "../styles.css";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const CATEGORY_ITEMS = [
  { key: "electronics", label: "Electronics", icon: Monitor },
  { key: "fashion", label: "Fashion", icon: Shirt },
  { key: "home", label: "Home", icon: Sofa },
  { key: "sports", label: "Sports", icon: Dumbbell },
  { key: "beauty", label: "Beauty", icon: Sparkles },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "toys", label: "Toys", icon: ToyBrick },
  { key: "mobiles", label: "Mobiles", icon: Smartphone },
  { key: "shoes", label: "Shoes", icon: Footprints },
  { key: "groceries", label: "Groceries", icon: ShoppingBasket },
  { key: "furniture", label: "Furniture", icon: BedDouble },
  { key: "watches", label: "Watches", icon: Watch }
];

const MainPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <h1 id="hero-heading">Welcome to ShopEase</h1>
        <p>Discover top-quality products at unbeatable prices.</p>
        <button type="button" className="btn-shop-now" onClick={() => window.location.href='/shop'}>Shop Now</button>
      </section>

      {/* Shop by Category Section */}
      <section className="categories" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="section-title">Shop by Category</h2>
        <div className="categories-container">
          {CATEGORY_ITEMS.map((category) => {
            const Icon = category.icon;

            return (
              <a key={category.key} href={`#${category.key}`} className="category-link">
                <div className="category-card">
                  <Icon size={24} strokeWidth={2} className="category-icon" aria-hidden="true" />
                  <span>{category.label}</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

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

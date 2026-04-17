import React, { useEffect, useState } from "react";
import "../styles.css";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

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
          <a href="#electronics" className="category-link"><div className="category-card">Electronics</div></a>
          <a href="#fashion" className="category-link"><div className="category-card">Fashion</div></a>
          <a href="#home" className="category-link"><div className="category-card">Home</div></a>
          <a href="#sports" className="category-link"><div className="category-card">Sports</div></a>
          <a href="#beauty" className="category-link"><div className="category-card">Beauty</div></a>
          <a href="#books" className="category-link"><div className="category-card">Books</div></a>
          <a href="#toys" className="category-link"><div className="category-card">Toys</div></a>
          <a href="#mobiles" className="category-link"><div className="category-card">Mobiles</div></a>
          <a href="#shoes" className="category-link"><div className="category-card">Shoes</div></a>
          <a href="#groceries" className="category-link"><div className="category-card">Groceries</div></a>
          <a href="#furniture" className="category-link"><div className="category-card">Furniture</div></a>
          <a href="#watches" className="category-link"><div className="category-card">Watches</div></a>
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
              <a href="#" aria-label="Instagram">
                <span className="home-footer-social-icon" aria-hidden="true">IG</span>
                <span>Instagram</span>
              </a>
              <a href="#" aria-label="Twitter">
                <span className="home-footer-social-icon" aria-hidden="true">X</span>
                <span>Twitter</span>
              </a>
              <a href="#" aria-label="Facebook">
                <span className="home-footer-social-icon" aria-hidden="true">f</span>
                <span>Facebook</span>
              </a>
            </div>

            <div className="home-footer-payments" aria-label="Accepted payment methods">
              <p>Payment Methods</p>
              <div className="home-footer-payment-pills">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>UPI</span>
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

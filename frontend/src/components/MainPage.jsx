import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import ProductCard from "./ProductCard";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const MainPage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch all products, then fetch variants for each product
    fetch(`${API_ORIGIN}/api/products`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!Array.isArray(data)) return setProducts([]);
        const activeProducts = data.filter(
          (product) => product?.is_active === true || product?.active === true
        );
        // Fetch variants for each product
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
      })
      .catch(() => setProducts([]));
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
      <div className="shop-products-grid-four">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Newsletter Subscription Section */}
      <section className="newsletter" aria-labelledby="newsletter-heading">
        <h3 id="newsletter-heading">Join our Newsletter</h3>
        <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
        <form className="newsletter-form" action="#" method="POST">
          <label htmlFor="email-subscribe" className="sr-only">Email address</label>
          <input type="email" id="email-subscribe" name="email" className="newsletter-input" placeholder="Enter your email address" required />
          <button type="submit" className="btn-subscribe">Subscribe</button>
        </form>
      </section>

      {/* Customer Reviews Section */}
      <section className="reviews" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="section-title">Customer Reviews</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="Profile of Sarah Jenkins" className="review-avatar" />
            <h3 className="review-name">Sarah Jenkins</h3>
            <p className="review-text">"ShopEase is my absolute favorite place to shop! The product quality always exceeds my expectations and shipping is incredibly fast."</p>
          </div>
          <div className="review-card">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" alt="Profile of Mark Robinson" className="review-avatar" />
            <h3 className="review-name">Mark Robinson</h3>
            <p className="review-text">"I bought the wireless headphones and couldn't be happier. Fantastic audio clarity, and the customer support team was very helpful."</p>
          </div>
          <div className="review-card">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" alt="Profile of Emily Chen" className="review-avatar" />
            <h3 className="review-name">Emily Chen</h3>
            <p className="review-text">"A beautifully designed site with top-tier products. I love the minimalist layout, making it so easy to find exactly what I need."</p>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer>
        <p>&copy; 2026 ShopEase. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default MainPage;

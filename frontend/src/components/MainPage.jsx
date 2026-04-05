import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

const MainPage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  safeProducts.slice(0, 10); // instead of products.slice(0, 10)

  return (
    <>
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
          <a href="#beauty" className="category-link"><div className="category-card"><span>Beauty</span></div></a>
          <a href="#books" className="category-link"><div className="category-card"><span>Books</span></div></a>
          <a href="#toys" className="category-link"><div className="category-card"><span>Toys</span></div></a>
        </div>
      </section>

      {/* Featured Products */}
      <div className="featured-products-grid">
        {safeProducts.slice(0, 3).map((product) => {
          // Use main_image and show price from first variant if available
          const price = Array.isArray(product.variants) && product.variants.length > 0
            ? product.variants[0].price
            : (product.price || '');
          return (
            <div
              className="product-card"
              key={product.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img src={product.main_image} alt={product.description || product.name} className="product-image" />
              <h3 className="product-title">{product.name}</h3>
              <span className="product-price">₹ {price}</span>
              <button type="button" className="btn-buy-now" onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}>Buy Now</button>
            </div>
          );
        })}
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
    </>
  );
};

export default MainPage;

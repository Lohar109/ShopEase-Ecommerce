import React from "react";
import "./Header.css";

const Header = () => (
  <header>
    <nav aria-label="Main Navigation">
      <div className="logo">
        <a href="/" aria-label="ShopEase Home">
          <strong>Shop<span className="logo-e">E</span>ase</strong>
        </a>
      </div>
      <form className="search-form" action="#" method="GET">
        <label htmlFor="search" className="sr-only">Search products</label>
        <input type="text" id="search" name="q" className="search-input" placeholder="Search products..." />
        <button type="submit" className="btn-search" aria-label="Search">Search</button>
      </form>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/shop">Shop</a></li>
        <li><a href="/cart">Cart</a></li>
      </ul>
    </nav>
  </header>
);

export default Header;

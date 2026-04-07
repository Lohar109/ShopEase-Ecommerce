import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";

const Header = () => {
  const { wishlist } = useContext(WishlistContext);

  return (
    <header>
      <nav aria-label="Main Navigation">
        <div className="logo">
          <a href="/" aria-label="ShopEase Home">
            Shop<span className="logo-e">E</span>ase
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
          <li>
            <a href="/wishlist" className="nav-wishlist-link">
              Wishlist <span style={{ color: '#28a745' }}>{wishlist.length}</span>
            </a>
          </li>
          <li><a href="/cart">Cart</a></li>
          <li><a href="/login">Login</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

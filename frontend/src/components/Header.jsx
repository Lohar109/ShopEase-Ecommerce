import React, { useContext } from "react";
import { Search, User } from "lucide-react";
import { WishlistContext } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { wishlist } = useContext(WishlistContext);
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

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
          <div className="search-input-wrap">
            <input type="text" id="search" name="q" className="search-input" placeholder="Search products..." />
            <button type="submit" className="btn-search-icon" aria-label="Search">
              <Search size={18} />
            </button>
          </div>
        </form>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li>
            <a href="/wishlist" className={`nav-text-badge-link ${wishlist.length > 0 ? "pulse-icon" : ""}`} aria-label="Wishlist">
              Wishlist
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </a>
          </li>
          <li>
            <a href="/cart" className="nav-text-badge-link" aria-label="Cart">
              Cart
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </a>
          </li>
          <li>
            <a href="/login" className="nav-icon-link" aria-label="Login">
              <User size={20} />
            </a>
          </li>
          <li>
            <details className="nav-menu-dropdown">
              <summary className="nav-icon-link nav-menu-trigger" aria-label="Menu">
                <span className="hamburger-text">☰</span>
              </summary>
              <ul className="nav-menu-panel" role="menu" aria-label="User menu">
                <li><a href="/profile">Profile</a></li>
                <li><a href="/orders">Orders</a></li>
                <li><a href="/addresses">Addresses</a></li>
                <li><a href="/settings">Settings</a></li>
                <li><a href="/support">Help / Support</a></li>
                <li><a href="/logout">Logout</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

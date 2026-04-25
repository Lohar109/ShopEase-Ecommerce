import React, { useContext, useMemo, useState } from "react";
import { Heart, Search, ShoppingCart, Sparkles, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const SEARCH_SUGGESTIONS = [
  "Wireless Headphones",
  "Smart Watch",
  "Bluetooth Speaker",
  "Sneakers",
  "Backpack",
  "Skin Care",
  "Books",
  "Home Decor",
  "Electronics",
  "Fashion"
];

const Header = () => {
  const location = useLocation();
  const { wishlist } = useContext(WishlistContext);
  const { cartItems } = useCart();
  const [query, setQuery] = useState("");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const isHomeRoute = location.pathname === "/";
  const isShopRoute = location.pathname.startsWith("/shop");

  const filteredSuggestions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) {
      return [];
    }

    return SEARCH_SUGGESTIONS
      .filter((item) => item.toLowerCase().includes(trimmedQuery))
      .slice(0, 6);
  }, [query]);

  const handleSuggestionPick = (value) => {
    setQuery(value);
    setIsSuggestionOpen(false);
  };

  const showSuggestions = isSuggestionOpen && filteredSuggestions.length > 0;

  return (
    <header>
      <nav aria-label="Main Navigation">
        <div className="logo">
          <a href="/" aria-label="ShopEase Home">
            <img src="/favicon.svg" alt="ShopEase logo" className="logo-mark h-10 w-auto object-contain" />
          </a>
        </div>
        <form className="search-form" action="#" method="GET" onSubmit={(event) => event.preventDefault()}>
          <div className="search-input-wrap">
            <span className="search-leading-icon" aria-hidden="true">
              <Search size={14} />
            </span>
            <input
              type="text"
              id="search"
              name="q"
              className="search-input"
              placeholder="Search products..."
              autoComplete="off"
              value={query}
              onFocus={() => setIsSuggestionOpen(true)}
              onBlur={() => setIsSuggestionOpen(false)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSuggestionOpen(true);
              }}
            />
            {showSuggestions && (
              <ul className="search-suggestions" role="listbox" aria-label="Search suggestions">
                {filteredSuggestions.map((item) => (
                  <li key={item} role="option">
                    <button
                      type="button"
                      className="search-suggestion-item"
                      onMouseDown={() => handleSuggestionPick(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
        <ul className="nav-links">
          <li>
            <a href="/" className={`nav-link-for-you ${isHomeRoute ? "active" : ""}`}>
              <Sparkles size={16} className="for-you-icon" />
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent font-bold">For You</span>
            </a>
          </li>
          <li><a href="/shop" className={isShopRoute ? "nav-link-active" : ""}>Shop</a></li>
          <li>
            <a href="/wishlist" className={`nav-text-badge-link ${wishlist.length > 0 ? "pulse-icon" : ""}`} aria-label="Wishlist">
              <Heart size={16} />
              <span className="nav-label-with-badge">
                Wishlist
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </span>
            </a>
          </li>
          <li>
            <a href="/cart" className="nav-text-badge-link" aria-label="Cart">
              <ShoppingCart size={16} />
              <span className="nav-label-with-badge">
                Cart
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </span>
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

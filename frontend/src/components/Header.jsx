import React, { useContext, useMemo, useState } from "react";
import { Heart, Search, ShoppingCart, Sparkles, User, ChevronDown, Package, Store, Gift, CreditCard, Bell, Headphones, Megaphone, Download } from "lucide-react";
import { useLocation, NavLink, Link } from "react-router-dom";
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
          <Link to="/" aria-label="ShopEase Home">
            <img src="/favicon.svg" alt="ShopEase logo" className="logo-mark h-10 w-auto object-contain" />
          </Link>
        </div>
        <form className="search-form" action="#" method="GET" onSubmit={(event) => event.preventDefault()}>
          <div className="search-input-wrap">
            <input
              type="text"
              id="search"
              name="q"
              className="search-input"
              placeholder="Search for Products, Brands and More"
              autoComplete="off"
              value={query}
              onFocus={() => setIsSuggestionOpen(true)}
              onBlur={() => setIsSuggestionOpen(false)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSuggestionOpen(true);
              }}
            />
            <span className="search-leading-icon" aria-hidden="true">
              <Search size={18} />
            </span>
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
            <NavLink to="/" className={({ isActive }) => `nav-link-for-you ${isActive ? "active" : ""}`}>
              {({ isActive }) => (
                <>
                  {isActive && <Sparkles size={16} className="for-you-icon animate-sparkle-icon" />}
                  <span className={isActive ? "bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent font-bold animate-magical-shimmer" : ""}>For You</span>
                </>
              )}
            </NavLink>
          </li>
          <li><Link to="/shop" className={isShopRoute ? "nav-link-active" : ""}>Shop</Link></li>
          <li>
            <Link to="/wishlist" className={`nav-text-badge-link ${wishlist.length > 0 ? "pulse-icon" : ""}`} aria-label="Wishlist">
              <Heart size={16} />
              <span className="nav-label-with-badge">
                Wishlist
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </span>
            </Link>
          </li>
          <li>
            <Link to="/cart" className="nav-text-badge-link" aria-label="Cart">
              <ShoppingCart size={16} />
              <span className="nav-label-with-badge">
                Cart
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </span>
            </Link>
          </li>
          <li className="nav-login-dropdown-wrapper">
            <Link to="/login" className="nav-text-badge-link nav-login-trigger" aria-label="Login">
              <User size={16} />
              <span>Login</span>
              <ChevronDown size={12} className="nav-chevron-icon" />
            </Link>
            
            {/* High-Fidelity Hover Dropdown Card */}
            <div className="nav-login-dropdown-card">
              <div className="dropdown-signup-row">
                <span className="signup-prompt-text">New customer?</span>
                <Link 
                  to="/login" 
                  className="signup-action-link" 
                  onClick={() => {
                    localStorage.setItem('shopease_auth_mode', 'register');
                  }}
                >
                  Sign Up
                </Link>
              </div>
              <div className="dropdown-divider" />
              <ul className="dropdown-menu-list">
                <li>
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                </li>

                <li>
                  <Link to="/profile?tab=orders" className="dropdown-item">
                    <Package size={16} />
                    <span>Orders</span>
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="dropdown-item">
                    <Heart size={16} />
                    <span>Wishlist</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=seller" className="dropdown-item">
                    <Store size={16} />
                    <span>Become a Seller</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=rewards" className="dropdown-item">
                    <Gift size={16} />
                    <span>Rewards</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=notifications" className="dropdown-item">
                    <Bell size={16} />
                    <span>Notification Preferences</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=care" className="dropdown-item">
                    <Headphones size={16} />
                    <span>24x7 Customer Care</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=advertise" className="dropdown-item">
                    <Megaphone size={16} />
                    <span>Advertise</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile?tab=download" className="dropdown-item">
                    <Download size={16} />
                    <span>Download App</span>
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

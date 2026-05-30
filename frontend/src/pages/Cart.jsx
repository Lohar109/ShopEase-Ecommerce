import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, Percent, ShieldCheck, ShoppingBag, Trash2, Crown, Tag, X, 
  Heart, Truck, Info, Link as LinkIcon, Gift, 
  Check
} from 'lucide-react';
import Lottie from 'lottie-react';
import emptyCartData from '../assets/empty-cart.json';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './Cart.css';
import { Stepper } from '../components/Stepper';

const CartLottie = Lottie?.default ?? Lottie;
const CartStepper = Stepper?.default ?? Stepper;

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const truncateWords = (text, limit = 3) => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, addToCart } = useCart();
  const { toggleWishlist } = React.useContext(WishlistContext);
  const navigate = useNavigate();

  const [showOffersModal, setShowOffersModal] = React.useState(false);
  const [showCouponsModal, setShowCouponsModal] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState('');
  const [selectedCouponCode, setSelectedCouponCode] = React.useState('');
  const [appliedCouponCode, setAppliedCouponCode] = React.useState('');

  const [dbProducts, setDbProducts] = React.useState([]);
  const youMayAlsoLikeRef = React.useRef(null);

  // Fetch products from database for recommendations
  React.useEffect(() => {
    fetch(`${API_ORIGIN}/api/products?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbProducts(data.filter(p => p.active || p.is_active === true));
        }
      })
      .catch(console.error);
  }, []);

  let totalMRP = 0;
  let totalDiscount = 0;

  cartItems.forEach((item) => {
    const qty = Number(item.quantity || 1);
    const originalPrice = Number(item.mrp ?? item.price ?? 0);
    totalMRP += originalPrice * qty;

    let savingsPerUnit = 0;
    const isPercentage = String(item.discount_type || '').toLowerCase() === 'percentage';
    const isFixed = String(item.discount_type || '').toLowerCase() === 'fixed';
    const discountVal = Number(item.discount_value || 0);

    if (discountVal > 0 && isPercentage) {
      savingsPerUnit = (originalPrice * discountVal) / 100;
    } else if (discountVal > 0 && isFixed) {
      savingsPerUnit = discountVal;
    } else {
      const m = Number(item.mrp || 0);
      const p = Number(item.price || 0);
      savingsPerUnit = Math.max(0, m - p);
    }

    totalDiscount += savingsPerUnit * qty;
  });

  const totalSellingPrice = Math.max(0, totalMRP - totalDiscount);
  const cartTotal = totalSellingPrice;
  const platformFee = totalMRP > 0 ? 250 : 0;
  const [availableCoupons, setAvailableCoupons] = React.useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = React.useState(true);

  React.useEffect(() => {
    setIsLoadingCoupons(true);
    fetch(`${API_ORIGIN}/api/coupons`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableCoupons(data.filter(c => c.is_active));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingCoupons(false));
  }, []);

  const getCouponSavings = (coupon) => {
    if (!coupon) return 0;
    const dType = coupon.discount_type || (coupon.discountValue && coupon.discountValue.type);
    const dValue = Number(coupon.discount_value) || (coupon.discountValue && Number(coupon.discountValue.value)) || 0;

    if (dType === 'fixed' || dType === 'flat') {
      return Math.min(dValue, totalMRP + platformFee - totalDiscount);
    }
    const rawSavings = (totalMRP * dValue) / 100;
    const cap = coupon.maxCap ?? rawSavings;
    return Math.min(rawSavings, cap);
  };

  const appliedCoupon = availableCoupons.find((coupon) => coupon.code === appliedCouponCode) || null;
  const selectedCoupon = availableCoupons.find((coupon) => coupon.code === selectedCouponCode) || null;
  const appliedCouponSavings = getCouponSavings(appliedCoupon);
  const selectedCouponSavings = getCouponSavings(selectedCoupon);
  const newGrandTotal = Math.max(0, totalMRP + platformFee - totalDiscount - appliedCouponSavings);
  const savingsAmount = totalDiscount + appliedCouponSavings;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout/shipping', { state: { cartItems, total: newGrandTotal } });
  };

  const handleDecrease = (item) => {
    updateQuantity(item.cartItemId, item.quantity - 1);
    toast('Cart updated', { icon: '🛒' });
  };

  const handleIncrease = (item) => {
    updateQuantity(item.cartItemId, item.quantity + 1);
    toast('Cart updated', { icon: '🛒' });
  };

  const handleRemove = (item) => {
    removeFromCart(item.cartItemId);
    toast('Item removed', { icon: '🗑️' });
  };

  const handleSaveForLater = (item) => {
    toggleWishlist(item.productId);
    removeFromCart(item.cartItemId);
    toast.success('Saved to wishlist');
  };

  const handleOpenCouponsModal = () => {
    setCouponInput('');
    setSelectedCouponCode(appliedCouponCode);
    setShowCouponsModal(true);
  };

  const handleCheckCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();
    const matchedCoupon = availableCoupons.find((coupon) => coupon.code === normalizedCode);

    if (!matchedCoupon) {
      toast.error('Coupon code not found');
      return;
    }

    setSelectedCouponCode(matchedCoupon.code);
    setCouponInput(matchedCoupon.code);
    toast.success(`${matchedCoupon.code} selected`);
  };

  const handleApplySelectedCoupon = () => {
    if (!selectedCoupon) {
      toast.error('Please select a coupon first');
      return;
    }

    setAppliedCouponCode(selectedCoupon.code);
    setShowCouponsModal(false);
    toast.success(`Applied ${selectedCoupon.code}`);
  };

  const resolveImageSrc = (src) => {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
    if (src.startsWith('/assets/')) return src;
    if (src.startsWith('/')) return `${API_ORIGIN}${src}`;
    return `${API_ORIGIN}/${src}`;
  };

  // Recommendation Lists (Dynamic + High-Fidelity Mock Fallbacks)
  const frequentlyBought = React.useMemo(() => {
    const filtered = dbProducts.filter(p => !cartItems.some(item => item.productId === p.id));
    if (filtered.length >= 3) {
      return filtered.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.variants?.[0]?.price || p.price || 499,
        image: p.main_image || p.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=200&auto=format&fit=crop',
        rawProduct: p
      }));
    }
    return [
      {
        id: 'fbt-1',
        name: 'Premium Glass Storage Jar (1000ml)',
        price: 499,
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'fbt-2',
        name: 'Wooden Honey Dipper',
        price: 149,
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'fbt-3',
        name: 'Silicone Spatula (Set of 2)',
        price: 199,
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?q=80&w=200&auto=format&fit=crop'
      }
    ];
  }, [dbProducts, cartItems]);

  const youMayAlsoLike = React.useMemo(() => {
    const filtered = dbProducts.filter(p => !cartItems.some(item => item.productId === p.id) && !frequentlyBought.some(f => f.id === p.id));
    if (filtered.length >= 4) {
      return filtered.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        price: p.variants?.[0]?.price || p.price || 599,
        image: p.main_image || p.images?.[0] || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=200&auto=format&fit=crop',
        rawProduct: p
      }));
    }
    return [
      {
        id: 'ymal-1',
        name: 'Almonds Premium California',
        price: 599,
        image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ymal-2',
        name: 'Pistachios Roasted & Salted',
        price: 649,
        image: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ymal-3',
        name: 'Organic Honey (500g)',
        price: 349,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ymal-4',
        name: 'Mixed Nuts (500g)',
        price: 599,
        image: 'https://images.unsplash.com/photo-1596560548464-f040c5f87484?q=80&w=200&auto=format&fit=crop'
      }
    ];
  }, [dbProducts, cartItems, frequentlyBought]);

  const handleAddRecommendation = (item) => {
    if (item.rawProduct) {
      const variants = Array.isArray(item.rawProduct.variants) ? item.rawProduct.variants : [];
      const fallbackVariant = variants.find(v => Boolean(v?.id));
      if (fallbackVariant) {
        addToCart(item.rawProduct, fallbackVariant);
        return;
      }
    }
    const mockProduct = {
      id: item.id,
      name: item.name,
      main_image: item.image,
      variants: [{ id: item.id + '-v1', price: item.price, mrp: item.price }]
    };
    addToCart(mockProduct, mockProduct.variants[0]);
  };

  const handleScrollLeft = () => {
    if (youMayAlsoLikeRef.current) {
      youMayAlsoLikeRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (youMayAlsoLikeRef.current) {
      youMayAlsoLikeRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const availableOffers = [
    {
      id: 1,
      title: '7.5% Cashback on select prepaid orders',
      description: 'via partner wallets',
      bank: 'Wallets',
      logoUrl: '/assets/logos/wallet.svg'
    },
    {
      id: 2,
      title: 'Up to 10% off with Axis Bank',
      description: 'Credit Cards on minimum spend',
      bank: 'Axis Bank',
      logoUrl: '/assets/logos/axis.png'
    }
  ];

  return (
    <div className="cart-page-shell block w-full min-h-screen">
      <div className="cart-page-inner block max-w-7xl mx-auto">
        {cartItems.length === 0 ? (
          <div
            className="cart-empty-state flex"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: 'calc(100vh - 150px)',
              gap: '40px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            <div className="cart-empty-lottie" aria-hidden="true">
              <CartLottie animationData={emptyCartData} autoPlay={true} loop={true} style={{ width: 350 }} />
            </div>
            <div className="cart-empty-content" style={{ textAlign: 'left', maxWidth: 'none', width: 'auto' }}>
              <h1
                className="cart-title"
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: '0',
                  marginBottom: '12px'
                }}
              >
                Your shopping bag is empty
              </h1>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: 1.6,
                  whiteSpace: 'nowrap',
                  marginBottom: '1.6rem'
                }}
              >
                Looks like you have not added anything yet. Explore our latest collection and find pieces worth carrying home.
              </p>
              <button
                type="button"
                className="cart-continue-btn"
                style={{ marginTop: '4px', width: '230px' }}
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <CartStepper currentStep={1} />

            <div className="cart-content">
              {/* Left Column: Cart list & suggestions */}
              <div className="cart-main-column">
                <div className="cart-items-container">
                  {/* Cart Header bar */}
                  <div className="cart-header-bar">
                    <div className="cart-header-left">
                      <span className="cart-header-icon-wrap">
                        <ShoppingBag size={18} fill="#e33170" stroke="#e33170" />
                      </span>
                      <h2>My Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="cart-items-list">
                    {cartItems.map((item) => (
                      <div className="cart-item-row" key={item.cartItemId}>
                        {/* Product Image */}
                        <Link to={`/product/${item.productId}`} className="cart-item-image-wrap">
                          <img
                            src={resolveImageSrc(item.image)}
                            alt={item.productName}
                            className="cart-item-image"
                          />
                        </Link>

                        {/* Middle Info Details */}
                        <div className="cart-item-middle-info">
                          {/* Best Seller mock badge */}
                          {item.price > 500 && (
                            <span className="cart-item-bestseller-badge">Best Seller</span>
                          )}
                          <h3 className="cart-item-name">
                            <Link to={`/product/${item.productId}`}>
                              {item.productName}
                            </Link>
                          </h3>
                          <div className="cart-item-attributes">
                            <span>Size: {item.size || 'Natural'}</span>
                            <span className="attr-divider">|</span>
                            <span>Color: {item.color || 'Standard'}</span>
                          </div>
                          
                          {/* Item Actions */}
                          <div className="cart-item-actions-row">
                            <button
                              type="button"
                              className="cart-item-action-btn remove"
                              onClick={() => handleRemove(item)}
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                            <button
                              type="button"
                              className="cart-item-action-btn save"
                              onClick={() => handleSaveForLater(item)}
                            >
                              <Heart size={14} />
                              <span>Save for later</span>
                            </button>
                          </div>
                        </div>

                        {/* Right Controls & Pricing */}
                        <div className="cart-item-right-controls">
                          <div className="cart-qty-spinner">
                            <button type="button" onClick={() => handleDecrease(item)}>−</button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => handleIncrease(item)}>+</button>
                          </div>
                          <div className="cart-item-price-display">
                            ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequently Bought Together */}
                <div className="cart-recommendations-box fbt">
                  <div className="rec-box-header">
                    <LinkIcon size={16} className="rec-header-icon" />
                    <h3>Frequently Bought Together</h3>
                  </div>
                  <div className="rec-fbt-grid">
                    {frequentlyBought.map((item) => (
                      <div className="fbt-card" key={item.id}>
                        <div className="fbt-card-image-wrap">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="fbt-card-details">
                          <h4>{truncateWords(item.name, 3)}</h4>
                          <span className="fbt-card-price">₹{Number(item.price || 0).toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          className="fbt-card-add-btn"
                          onClick={() => handleAddRecommendation(item)}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* You May Also Like */}
                <div className="cart-recommendations-box ymal">
                  <div className="rec-box-header ymal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift size={16} className="rec-header-icon" />
                      <h3>You May Also Like</h3>
                    </div>

                  </div>
                  
                  <div className="ymal-slider-container" ref={youMayAlsoLikeRef}>
                    {youMayAlsoLike.map((item) => (
                      <div className="ymal-card" key={item.id}>
                        <div className="ymal-card-image-wrap">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="ymal-card-details">
                          <h4>{item.name}</h4>
                          <div className="ymal-card-footer">
                            <span className="ymal-card-price">₹{Number(item.price || 0).toFixed(2)}</span>
                            <button
                              type="button"
                              className="ymal-card-add-btn"
                              onClick={() => handleAddRecommendation(item)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Summaries, Offers & Trust */}
              <div className="cart-summary-column">
                {/* Available Offers Sidebar box */}
                <div className="cart-offers-sidebar-card">
                  <div className="offers-sidebar-header">
                    <Percent size={14} className="offers-icon-tag" />
                    <h3>Available Offers</h3>
                  </div>
                  <div className="offers-sidebar-list">
                    {availableOffers.map((offer) => (
                      <div className="offers-sidebar-row" key={offer.id}>
                        <div className="offers-logo-dot">
                          <Check size={10} color="#e33170" strokeWidth={3} />
                        </div>
                        <div className="offers-text-details">
                          <p className="offer-main-title">{offer.title}</p>
                          <p className="offer-sub-title">{offer.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="offers-view-more-link"
                    onClick={() => setShowOffersModal(true)}
                  >
                    View More Offers
                  </button>
                </div>

                {/* Apply Coupons Trigger */}
                <button
                  type="button"
                  className="cart-coupon-trigger"
                  onClick={handleOpenCouponsModal}
                >
                  <span className="cart-coupon-trigger-icon" aria-hidden="true">
                    <Tag size={13} strokeWidth={2.5} />
                  </span>
                  <span className="cart-coupon-trigger-label">Apply Coupons</span>
                  <span className="cart-coupon-trigger-action">APPLY</span>
                </button>

                {/* Price/Order Summary Details */}
                <aside className="cart-summary-card">
                  <h3>Order Summary</h3>
                  
                  <div className="cart-summary-row">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <strong>₹{totalMRP.toFixed(2)}</strong>
                  </div>
                  
                  <div className="cart-summary-row">
                    <span className="fee-label-with-icon">
                      Platform Fee
                      <Info size={12} className="fee-info-icon" title="Standard checkout handling charge" />
                    </span>
                    <span>₹{platformFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="cart-summary-row">
                    <span>Discount</span>
                    <strong className="cart-summary-discount">-₹{totalDiscount.toFixed(2)}</strong>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="cart-summary-row coupon-savings-row">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <strong className="coupon-discount">-₹{appliedCouponSavings.toFixed(2)}</strong>
                    </div>
                  )}

                  <div className="cart-summary-row shipping-row">
                    <span className="shipping-label-with-icon">
                      Shipping
                      <Truck size={12} className="shipping-truck-icon" />
                    </span>
                    <strong className="shipping-free-label">FREE</strong>
                  </div>

                  <div className="cart-summary-row-divider" />
                  
                  <div className="cart-summary-row grand-total-row">
                    <span>Grand Total</span>
                    <strong>₹{newGrandTotal.toFixed(2)}</strong>
                  </div>

                  {savingsAmount > 0 && (
                    <div className="cart-savings-toast-box" role="status">
                      <span className="savings-check-badge">
                        <Check size={10} color="#ffffff" strokeWidth={3} />
                      </span>
                      <span>You've saved ₹{savingsAmount.toFixed(2)} on this order!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="cart-checkout-btn"
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                  
                  <div className="cart-secure-label-row">
                    <ShieldCheck size={14} className="secure-badge-icon" />
                    <span>100% Secure Payments</span>
                  </div>
                </aside>

              </div>
            </div>

            {/* Full Available Offers Modal */}
            {showOffersModal && (
              <div className="cart-offers-modal-overlay" onClick={() => setShowOffersModal(false)}>
                <div className="cart-offers-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="cart-offers-modal-header">
                    <h2>Available Offers</h2>
                    <button
                      type="button"
                      className="cart-offers-modal-close-btn"
                      onClick={() => setShowOffersModal(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="cart-offers-modal-body">
                    <div className="cart-offers-modal-list">
                      {availableOffers.map((offer) => (
                        <div className="cart-offers-modal-row" key={offer.id}>
                          <div className="modal-offer-icon-badge">
                            <Percent size={14} />
                          </div>
                          <div className="modal-offer-text">
                            <h4>{offer.title}</h4>
                            <p>{offer.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Coupon Modal */}
            {showCouponsModal && (
              <div className="cart-coupons-modal-overlay" onClick={() => setShowCouponsModal(false)}>
                <div className="cart-coupons-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="cart-coupons-modal-header">
                    <h2>APPLY COUPON</h2>
                    <button
                      type="button"
                      className="cart-coupons-modal-close-btn"
                      onClick={() => setShowCouponsModal(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="cart-coupons-modal-body">
                    <div className="cart-coupons-input-row">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value)}
                        placeholder="Enter coupon code"
                        className="cart-coupons-input"
                      />
                      <button
                        type="button"
                        className="cart-coupons-check-btn"
                        onClick={handleCheckCoupon}
                        disabled={!couponInput.trim()}
                      >
                        CHECK
                      </button>
                    </div>

                    <div className="cart-coupons-list" aria-label="Available coupons" style={{ minHeight: '300px', position: 'relative' }}>
                      {isLoadingCoupons ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '3px solid #e33170', borderRadius: '50%' }}></div>
                        </div>
                      ) : (
                        (() => {
                          const getCouponEligibility = (coupon) => {
                            const minOrderValue = Number(coupon.min_order_value) || 0;
                            if (cartTotal < minOrderValue) {
                              return { eligible: false, diff: minOrderValue - cartTotal, lockedReason: 'minSpend' };
                            }
                            return { eligible: true, diff: 0 };
                          };

                          const processed = availableCoupons.map(coupon => {
                            const eligibility = getCouponEligibility(coupon);
                            return { ...coupon, savings: getCouponSavings(coupon), eligibility };
                          });
                          
                          const eligible = processed.filter(c => c.eligibility.eligible).sort((a, b) => b.savings - a.savings);
                          const locked = processed.filter(c => !c.eligibility.eligible).sort((a, b) => a.eligibility.diff - b.eligibility.diff);
                          
                          return (
                            <>
                              {eligible.length === 0 && locked.length === 0 && (
                                <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginTop: '40px' }}>
                                  No coupons available at the moment.
                                </p>
                              )}
                              {eligible.map((coupon, index) => {
                                const isSelected = selectedCouponCode === coupon.code;
                                const isBestValue = index === 0;
                                
                                return (
                                  <label 
                                    className={`cart-coupon-item ${isSelected ? 'is-selected' : ''}`} 
                                    key={coupon.code} 
                                    style={{ 
                                      position: 'relative', 
                                      padding: '16px', 
                                      border: isBestValue ? '1.5px solid #e33170' : '1px solid #eef0f3',
                                      borderRadius: '12px',
                                      display: 'flex',
                                      gap: '12px',
                                      alignItems: 'center',
                                      marginTop: '8px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isBestValue && (
                                      <span style={{ 
                                        position: 'absolute', 
                                        top: '-12px', 
                                        right: '16px', 
                                        background: '#e33170', 
                                        color: '#ffffff', 
                                        fontSize: '9px', 
                                        fontWeight: '700', 
                                        textTransform: 'uppercase', 
                                        padding: '2px 8px', 
                                        borderRadius: '10px'
                                      }}>
                                        BEST VALUE
                                      </span>
                                    )}
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(event) => setSelectedCouponCode(event.target.checked ? coupon.code : '')}
                                      style={{ accentColor: '#e33170' }}
                                    />
                                    <div className="cart-coupon-code-box" style={{ padding: '4px 10px', border: '1px dashed #e33170', borderRadius: '6px', color: '#e33170', fontWeight: '700', fontSize: '12px' }}>
                                      {coupon.code}
                                    </div>
                                    <div className="cart-coupon-meta" style={{ flex: 1 }}>
                                      <p className="cart-coupon-title" style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                                        Save ₹{coupon.savings.toFixed(0)}
                                      </p>
                                      <p className="cart-coupon-desc" style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                                        {coupon.description}
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}

                              {locked.map(coupon => (
                                <div className="cart-coupon-item is-locked" key={coupon.code} style={{ opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)', marginTop: '8px', padding: '16px', border: '1px solid #eef0f3', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <input type="checkbox" disabled />
                                  <div className="cart-coupon-code-box" style={{ padding: '4px 10px', border: '1px dashed #9ca3af', borderRadius: '6px', color: '#9ca3af', fontWeight: '700', fontSize: '12px' }}>
                                    {coupon.code}
                                  </div>
                                  <div className="cart-coupon-meta" style={{ flex: 1 }}>
                                    <p className="cart-coupon-title" style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                      Add ₹{coupon.eligibility.diff.toFixed(0)} more to unlock
                                    </p>
                                    <p className="cart-coupon-desc" style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                      {coupon.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  <div className="cart-coupons-modal-footer">
                    <div className="cart-coupons-footer-copy">
                      <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginRight: '6px' }}>Savings:</span>
                      <strong style={{ fontSize: '16px', color: '#e33170' }}>₹{selectedCouponSavings.toFixed(0)}</strong>
                    </div>
                    <button
                      type="button"
                      className="cart-coupons-apply-btn"
                      onClick={handleApplySelectedCoupon}
                    >
                      APPLY COUPON
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

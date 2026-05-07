import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Percent, ShieldCheck, ShoppingBag, Trash2, Crown, Tag, X } from 'lucide-react';
import Lottie from 'lottie-react';
import emptyCartData from '../assets/empty-cart.json';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import './Cart.css';
import { Stepper } from '../components/Stepper';

const CartLottie = Lottie?.default ?? Lottie;
const CartStepper = Stepper?.default ?? Stepper;

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [showOffersModal, setShowOffersModal] = React.useState(false);
  const [showCouponsModal, setShowCouponsModal] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState('');
  const [selectedCouponCode, setSelectedCouponCode] = React.useState('');
  const [appliedCouponCode, setAppliedCouponCode] = React.useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const platformFee = 250;
  const memberDiscount = -5000;
  const availableCoupons = [
    {
      code: 'SAVE100',
      title: 'Instant Rs. 100 off',
      discountValue: { type: 'fixed', value: 100 },
      description: 'Save instantly on this order',
      tc: 'Applicable on prepaid checkout only',
      expiry: 'Valid till 31 May 2026'
    },
    {
      code: 'FESTIVE10',
      title: '10% off up to Rs. 250',
      discountValue: { type: 'percentage', value: 10 },
      description: 'A clean boost for your cart total',
      tc: 'Minimum order value applies',
      expiry: 'Valid till 15 May 2026'
    },
    {
      code: 'PREMIUM150',
      title: 'Flat Rs. 150 discount',
      discountValue: { type: 'fixed', value: 150 },
      description: 'Best for smaller carts',
      tc: 'Can be used once per user',
      expiry: 'Valid till 7 Jun 2026'
    },
    {
      code: 'STYLE15',
      title: '15% off on fashion picks',
      discountValue: { type: 'percentage', value: 15 },
      description: 'Premium style savings on eligible items',
      tc: 'Maximum discount capped at Rs. 300',
      expiry: 'Valid till 20 May 2026'
    },
    {
      code: 'BAG75',
      title: 'Save Rs. 75 today',
      discountValue: { type: 'fixed', value: 75 },
      description: 'A quick win for your checkout',
      tc: 'Limited-time coupon',
      expiry: 'Valid till 10 May 2026'
    }
  ];

  const getCouponSavings = (coupon) => {
    if (!coupon) return 0;
    if (coupon.discountValue.type === 'fixed') {
      return Math.min(coupon.discountValue.value, subtotal + platformFee + Math.abs(memberDiscount));
    }
    const rawSavings = (subtotal * coupon.discountValue.value) / 100;
    const cap = coupon.maxCap ?? rawSavings;
    return Math.min(rawSavings, cap);
  };

  const appliedCoupon = availableCoupons.find((coupon) => coupon.code === appliedCouponCode) || null;
  const selectedCoupon = availableCoupons.find((coupon) => coupon.code === selectedCouponCode) || null;
  const appliedCouponSavings = getCouponSavings(appliedCoupon);
  const selectedCouponSavings = getCouponSavings(selectedCoupon);
  const newGrandTotal = subtotal + platformFee + memberDiscount - appliedCouponSavings;
  const savingsAmount = Math.abs(memberDiscount) - platformFee + appliedCouponSavings;

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
    // Don't prepend API_ORIGIN for frontend assets like logos
    if (src.startsWith('/assets/')) return src;
    if (src.startsWith('/')) return `${API_ORIGIN}${src}`;
    return `${API_ORIGIN}/${src}`;
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

  const availableOffers = [
    {
      id: 1,
      title: '7.5% Cashback on select prepaid orders',
      description: 'Via partner wallets',
      bank: 'Wallets',
      bankLogo: 'wallet',
      logoUrl: '/assets/logos/wallet.svg',
      minSpend: 0,
      discountValue: { type: 'percentage', value: 7.5 },
      hasTC: true
    },
    {
      id: 2,
      title: 'Up to 10% off with Axis Bank',
      description: 'Credit Cards on minimum spend',
      bank: 'Axis Bank',
      bankLogo: 'axis',
      logoUrl: '/assets/logos/axis.png',
      minSpend: 5000,
      discountValue: { type: 'percentage', value: 10 },
      hasTC: true
    },
    {
      id: 3,
      title: 'Flat 15% instant discount',
      description: 'HSBC Bank Cards, up to capped value',
      bank: 'HSBC Bank',
      bankLogo: 'hsbc',
      logoUrl: '/assets/logos/hsbc.svg',
      minSpend: 8000,
      discountValue: { type: 'percentage', value: 15 },
      hasTC: true
    },
    {
      id: 4,
      title: '5% off on Mobikwik wallet',
      description: 'Eligible orders',
      bank: 'Mobikwik',
      bankLogo: 'mobikwik',
      logoUrl: '/assets/logos/mobikwik.svg',
      minSpend: 2000,
      discountValue: { type: 'percentage', value: 5 },
      hasTC: true
    },
    {
      id: 5,
      title: 'Save on UPI checkout',
      description: 'Bank and wallet offers',
      bank: 'UPI',
      bankLogo: 'upi',
      logoUrl: '/assets/logos/upi.svg',
      minSpend: 1500,
      discountValue: { type: 'percentage', value: 8 },
      hasTC: true
    },
    {
      id: 6,
      title: 'Flat Rs. 300 off',
      description: 'On orders above minimum cart value',
      bank: 'Cards',
      bankLogo: 'card',
      logoUrl: '/assets/logos/card.svg',
      minSpend: 6000,
      discountValue: { type: 'fixed', value: 300 },
      hasTC: true
    },
    {
      id: 7,
      title: 'Additional 10% off',
      description: 'First payment with digital wallets',
      bank: 'Wallets',
      bankLogo: 'wallet',
      logoUrl: '/assets/logos/wallet.png',
      minSpend: 3000,
      discountValue: { type: 'percentage', value: 10 },
      hasTC: true
    },
    {
      id: 8,
      title: 'Free shipping on prepaid',
      description: 'During current offer window',
      bank: 'All',
      bankLogo: 'shipping',
      logoUrl: '/assets/logos/shipping.svg',
      minSpend: 2500,
      discountValue: { type: 'fixed', value: 150 },
      hasTC: true
    },
    {
      id: 9,
      title: 'Extra Rs. 200 cashback',
      description: 'Partner bank payment methods',
      bank: 'Banks',
      bankLogo: 'bank',
      logoUrl: '/assets/logos/bank.svg',
      minSpend: 4000,
      discountValue: { type: 'fixed', value: 200 },
      hasTC: true
    },
    {
      id: 10,
      title: 'Up to 12% off',
      description: 'Selected categories with bank offers',
      bank: 'Banks',
      bankLogo: 'bank',
      logoUrl: '/assets/logos/bank.svg',
      minSpend: 7000,
      discountValue: { type: 'percentage', value: 12 },
      hasTC: true
    },
    {
      id: 11,
      title: 'Weekend special 7% off',
      description: 'Instant discount on cart totals',
      bank: 'All',
      bankLogo: 'gift',
      logoUrl: '/assets/logos/gift.svg',
      minSpend: 3500,
      discountValue: { type: 'percentage', value: 7 },
      hasTC: true
    },
    {
      id: 12,
      title: 'Flat Rs. 150 off',
      description: 'Supported wallet checkout',
      bank: 'Wallets',
      bankLogo: 'wallet',
      logoUrl: '/assets/logos/wallet.svg',
      minSpend: 1200,
      discountValue: { type: 'fixed', value: 150 },
      hasTC: true
    },
    {
      id: 13,
      title: 'Get bonus cashback',
      description: 'Recurring prepaid purchases',
      bank: 'All',
      bankLogo: 'repeat',
      logoUrl: '/assets/logos/repeat.svg',
      minSpend: 5000,
      discountValue: { type: 'percentage', value: 3 },
      hasTC: true
    },
    {
      id: 14,
      title: 'Extra 5% off',
      description: 'App-exclusive payment offers',
      bank: 'App',
      bankLogo: 'mobile',
      logoUrl: '/assets/logos/mobile.svg',
      minSpend: 0,
      discountValue: { type: 'percentage', value: 5 },
      hasTC: true
    },
    {
      id: 15,
      title: 'Limited-time festive offer',
      description: 'Additional savings on eligible payments',
      bank: 'All',
      bankLogo: 'gift',
      logoUrl: '/assets/logos/gift.svg',
      minSpend: 4000,
      discountValue: { type: 'percentage', value: 8 },
      hasTC: true
    }
  ];

  // Calculate eligibility and savings for each offer
  const getOfferEligibility = (offer) => {
    return cartTotal >= offer.minSpend;
  };

  const getOfferSavings = (offer) => {
    if (offer.discountValue.type === 'fixed') {
      return offer.discountValue.value;
    }
    return (cartTotal * offer.discountValue.value) / 100;
  };

  const spendToUnlock = (offer) => {
    return Math.max(0, offer.minSpend - cartTotal);
  };

  // Find the best value offer (highest savings among unlocked offers)
  const getBestValueOffer = () => {
    const unlockedOffers = availableOffers.filter(getOfferEligibility);
    if (unlockedOffers.length === 0) return null;
    return unlockedOffers.reduce((best, offer) => {
      const bestSavings = getOfferSavings(best);
      const offerSavings = getOfferSavings(offer);
      return offerSavings > bestSavings ? offer : best;
    });
  };

  const bestValueOffer = getBestValueOffer();
  const previewOffers = availableOffers.slice(0, 2);

  // Find the "Next Best Offer" - locked offer closest to unlocking
  const getNextBestOffer = () => {
    const lockedOffers = availableOffers.filter(offer => !getOfferEligibility(offer));
    if (lockedOffers.length === 0) return null;
    
    // Find the one with smallest amount needed to unlock
    return lockedOffers.reduce((closest, offer) => {
      const currentSpendMore = spendToUnlock(offer);
      const closestSpendMore = spendToUnlock(closest);
      return currentSpendMore < closestSpendMore ? offer : closest;
    });
  };

  const nextBestOffer = getNextBestOffer();
  const amountToUnlock = nextBestOffer ? spendToUnlock(nextBestOffer) : null;

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
              fontFamily: "Poppins, sans-serif"
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
              <div className="cart-main-column">
                <section className="cart-offers-section-main" aria-label="Available offers">
                  {nextBestOffer && amountToUnlock > 0 && (
                    <div className="cart-upsell-banner">
                      <p>
                        Add items worth <span className="upsell-amount">₹{amountToUnlock.toFixed(0)}</span> more to unlock a <strong>{nextBestOffer.title}</strong>!
                      </p>
                    </div>
                  )}

                  <div className="cart-offers-container">
                    <div className="cart-offers-header">
                      <span className="cart-offers-icon" aria-hidden="true">
                        <Percent size={16} strokeWidth={2.25} />
                      </span>
                      <h3>Available Offers</h3>
                    </div>

                    <div className="cart-offers-preview" aria-label="Offer preview">
                      {previewOffers.map((offer) => {
                        const isEligible = getOfferEligibility(offer);
                        const savings = getOfferSavings(offer);
                        const spendMore = spendToUnlock(offer);
                        const progress = isEligible ? 100 : (offer.minSpend > 0 ? (cartTotal / offer.minSpend) * 100 : 100);
                        const isBestValue = bestValueOffer && bestValueOffer.id === offer.id;

                        return (
                          <div className="cart-offer-row" key={offer.id}>
                            <div className={`offer-logo-frame ${isBestValue ? 'is-best' : ''}`}>
                              <img
                                src={resolveImageSrc(offer.logoUrl)}
                                alt={offer.bank}
                                className={`offer-logo offer-logo--sidebar ${!isEligible ? 'is-locked' : ''}`}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <p style={{ margin: 0, color: '#374151', fontSize: '13px', fontWeight: 500 }}>
                                  {offer.title}
                                </p>
                              </div>
                              <p style={{ margin: '2px 0 6px 0', color: '#9ca3af', fontSize: '12px' }}>
                                {offer.description}
                              </p>
                              {!isEligible && (
                                <>
                                  <div className="cart-offer-progress-bar">
                                    <div className="cart-offer-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                                  </div>
                                  <p style={{ margin: '4px 0 0 0', color: '#ff3f6c', fontSize: '11px', fontWeight: 500 }}>
                                    Spend ₹{spendMore.toFixed(0)} more to unlock
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="cart-offers-toggle"
                      onClick={() => setShowOffersModal(true)}
                    >
                      Show More
                    </button>
                  </div>
                </section>

                <div className="cart-list">
              {cartItems.map(item => (
                <div className="cart-item" key={item.cartItemId}>
                  <Link to={`/product/${item.productId}`} className="cart-item-image-link">
                    <div className="cart-item-image-wrap">
                      <img
                        src={resolveImageSrc(item.image)}
                        alt={item.productName}
                        className="cart-item-image"
                      />
                    </div>
                  </Link>

                  <div className="cart-item-details">
                    <h3>
                      <Link to={`/product/${item.productId}`} className="cart-item-title-link">
                        {item.productName}
                      </Link>
                    </h3>
                    <p>Size: {item.size || 'N/A'}</p>
                    <p>Color: {item.color || 'N/A'}</p>
                    <p>Price: ₹ {item.price ?? 'N/A'}</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-control">
                      <button type="button" onClick={() => handleDecrease(item)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => handleIncrease(item)}>+</button>
                    </div>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${item.productName} from cart`}
                      title="Remove item"
                    >
                      <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
                </div>
              </div>

              <aside className="cart-summary-column">
                <button
                  type="button"
                  className="cart-coupon-trigger"
                  onClick={handleOpenCouponsModal}
                >
                  <span className="cart-coupon-trigger-icon" aria-hidden="true">
                    <Tag size={16} strokeWidth={2.2} />
                  </span>
                  <span className="cart-coupon-trigger-label">Apply Coupons</span>
                  <span className="cart-coupon-trigger-action">APPLY</span>
                </button>

                {/* NEW: Price Details moved to top */}
                <aside className="cart-summary-card">
                  <h3>Price Details</h3>
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <strong>₹ {subtotal.toFixed(2)}</strong>
                  </div>
                  <div className="cart-summary-row">
                    <span className="cart-summary-title">
                      Platform Fee <ChevronDown size={14} aria-hidden="true" />
                    </span>
                    <span>₹ {platformFee.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span className="cart-summary-title">
                      Discount <ChevronDown size={14} aria-hidden="true" />
                    </span>
                    <strong className="cart-summary-discount">-₹ {Math.abs(memberDiscount).toFixed(2)}</strong>
                  </div>
                  {appliedCoupon && (
                    <div className="cart-summary-row cart-summary-coupon-row">
                      <span className="cart-summary-title">Coupon ({appliedCoupon.code})</span>
                      <strong className="cart-summary-coupon">-₹ {appliedCouponSavings.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className="cart-summary-row grand-total">
                    <span>Grand Total</span>
                    <strong>₹ {newGrandTotal.toFixed(2)}</strong>
                  </div>

                  <div className="cart-savings-box" role="status" aria-live="polite">
                    <ShieldCheck size={22} aria-hidden="true" />
                    <span>You've saved ₹{savingsAmount.toFixed(2)} on this order!</span>
                  </div>

                  <button
                    type="button"
                    className="cart-checkout-btn"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </aside>
              </aside>
            </div>

            {showOffersModal && (
              <div className="cart-offers-modal-overlay" onClick={() => setShowOffersModal(false)}>
                <div className="cart-offers-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="cart-offers-modal-header">
                    <h2>Available Offers</h2>
                    <button
                      type="button"
                      className="cart-offers-modal-close"
                      onClick={() => setShowOffersModal(false)}
                      aria-label="Close available offers"
                    >
                      Close
                    </button>
                  </div>

                  <div className="cart-offers-modal-body">
                    <div className="cart-offers-modal-grid">
                      {availableOffers.map((offer) => {
                        const isEligible = getOfferEligibility(offer);
                        const savings = getOfferSavings(offer);
                        const spendMore = spendToUnlock(offer);
                        const progress = isEligible ? 100 : (cartTotal / offer.minSpend) * 100;
                        const isBestValue = bestValueOffer && bestValueOffer.id === offer.id;

                        return (
                          <div className={`cart-offers-modal-item ${isBestValue ? 'is-best-value' : ''}`} key={offer.id}>
                            {isBestValue && (
                              <div className="cart-offer-best-badge">
                                <Crown size={14} />
                                <span>Best Deal</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                              <div className={`offer-logo-frame ${isBestValue ? 'is-best' : ''}`}>
                                <img
                                  src={resolveImageSrc(offer.logoUrl)}
                                  alt={offer.bank}
                                  className={`offer-logo ${!isEligible ? 'is-locked' : ''}`}
                                  width={48}
                                  height={48}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <p style={{ margin: 0, color: '#1f2937', fontSize: '13px', fontWeight: 600 }}>
                                    {offer.title}
                                  </p>
                                </div>
                                <p style={{ margin: '2px 0 6px 0', color: '#6b7280', fontSize: '12px' }}>
                                  {offer.description}
                                </p>
                                {isEligible && (
                                  <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '12px', fontWeight: 500 }}>
                                    You save ₹{savings.toFixed(0)}
                                  </p>
                                )}
                                {!isEligible && (
                                  <>
                                    <div className="cart-offer-progress-bar">
                                      <div className="cart-offer-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', color: '#ff3f6c', fontSize: '11px', fontWeight: 500 }}>
                                      Spend ₹{spendMore.toFixed(0)} more to unlock
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showCouponsModal && (
              <div className="cart-coupons-modal-overlay" onClick={() => setShowCouponsModal(false)}>
                <div className="cart-coupons-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="cart-coupons-modal-header">
                    <h2>APPLY COUPON</h2>
                    <button
                      type="button"
                      className="cart-coupons-modal-close"
                      onClick={() => setShowCouponsModal(false)}
                      aria-label="Close coupon modal"
                    >
                      <X size={18} strokeWidth={2.25} />
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

                    <div className="cart-coupons-list" aria-label="Available coupons">
                      {availableCoupons.map((coupon) => {
                        const isSelected = selectedCouponCode === coupon.code;
                        const savings = getCouponSavings(coupon);

                        return (
                          <label className={`cart-coupon-item ${isSelected ? 'is-selected' : ''}`} key={coupon.code}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => setSelectedCouponCode(event.target.checked ? coupon.code : '')}
                            />
                            <div className="cart-coupon-item-content">
                              <div className="cart-coupon-code-box">{coupon.code}</div>
                              <div className="cart-coupon-meta">
                                <p className="cart-coupon-title">Save ₹{savings.toFixed(0)}</p>
                                <p className="cart-coupon-desc">
                                  {coupon.description} <span className="cart-coupon-more">more</span>
                                </p>
                                <p className="cart-coupon-expiry">{coupon.expiry} · {coupon.tc}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="cart-coupons-modal-footer">
                    <div className="cart-coupons-footer-copy">
                      <span>Maximum savings: ₹{selectedCouponSavings.toFixed(0)}</span>
                    </div>
                    <button
                      type="button"
                      className="cart-coupons-apply-btn"
                      onClick={handleApplySelectedCoupon}
                    >
                      APPLY
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

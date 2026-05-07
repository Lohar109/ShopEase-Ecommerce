import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Percent, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
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

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const platformFee = 250;
  const memberDiscount = -5000;
  const newGrandTotal = subtotal + platformFee + memberDiscount;
  const savingsAmount = Math.abs(memberDiscount) - platformFee;

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

  const resolveImageSrc = (src) => {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
    if (src.startsWith('/')) return `${API_ORIGIN}${src}`;
    return `${API_ORIGIN}/${src}`;
  };

  const availableOffers = [
    '7.5% Cashback on select prepaid orders via partner wallets. T&C',
    'Up to 10% off with Axis Bank Credit Cards on minimum spend. T&C',
    'Flat 15% instant discount on HSBC Bank Cards, up to a capped value. T&C',
    'Get 5% off on Mobikwik wallet payments with eligible orders. T&C',
    'Save extra on UPI checkout with limited-time bank and wallet offers. T&C',
    'Flat Rs. 300 off on orders above a minimum cart value with select cards. T&C',
    'Additional 10% off on first payment using eligible digital wallets. T&C',
    'Free shipping on prepaid orders during the current offer window. T&C',
    'Extra Rs. 200 cashback on orders using partner bank payment methods. T&C',
    'Up to 12% off on selected categories with co-branded bank offers. T&C',
    'Weekend special: 7% instant discount on cart totals above threshold. T&C',
    'Flat Rs. 150 off when paying through supported wallet checkout. T&C',
    'Get bonus cashback on recurring prepaid purchases. T&C',
    'Extra 5% off on app-exclusive payment offers. T&C',
    'Limited-time festive offer: additional savings on eligible payment methods. T&C'
  ];

  const previewOffers = availableOffers.slice(0, 2);

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
            <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="cart-list block lg:col-span-2">
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

              <aside className="cart-summary-column block lg:col-span-1">
                <section className="cart-offers-card" aria-label="Available offers">
                  <div className="cart-offers-header">
                    <span className="cart-offers-icon" aria-hidden="true">
                      <Percent size={16} strokeWidth={2.25} />
                    </span>
                    <h3>Available Offers</h3>
                  </div>

                  <div className="cart-offers-preview" aria-label="Offer preview">
                    {previewOffers.map((offer) => (
                      <div className="cart-offer-row" key={offer}>
                        <span className="cart-offer-dot" aria-hidden="true" />
                        <p>
                          {offer.split(' T&C')[0]}
                          <span className="cart-offer-tc"> T&amp;C</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="cart-offers-toggle"
                    onClick={() => setShowOffersModal(true)}
                  >
                    Show More
                  </button>
                </section>

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
                      {availableOffers.map((offer) => (
                        <div className="cart-offers-modal-item" key={offer}>
                          <span className="cart-offers-modal-dot" aria-hidden="true" />
                          <p>
                            {offer.split(' T&C')[0]}
                            <span className="cart-offer-tc"> T&amp;C</span>
                          </p>
                        </div>
                      ))}
                    </div>
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

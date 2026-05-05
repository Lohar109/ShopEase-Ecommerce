import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';
import './Shipping.css';

const Shipping = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
  const total = Number(state?.total || 0);
  const shippingFormRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    stateName: '',
    city: '',
    houseNo: '',
    roadName: '',
  });
  const [isAddressSaved, setIsAddressSaved] = useState(false);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [cartItems]
  );
  const deliveryFee = 0;
  const grandTotal = total || subtotal + deliveryFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (cartItems.length === 0) return;
    setIsAddressSaved(true);
  };

  const handleSidebarAction = () => {
    if (!isAddressSaved) {
      shippingFormRef.current?.requestSubmit();
      return;
    }

    navigate('/checkout/payment', {
      state: {
        cartItems,
        total: grandTotal,
        shippingAddress: formData,
      },
    });
  };

  const formattedAddress = [
    formData.houseNo,
    formData.roadName,
    formData.city,
    formData.stateName,
    formData.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-shell block w-full min-h-screen">
        <div className="cart-page-inner block max-w-7xl mx-auto">
          <div
            className="cart-empty-state flex"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              textAlign: 'center',
              gap: '12px',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <ShoppingBag size={82} strokeWidth={1.5} color="#d1d5db" aria-hidden="true" />
            <h1 className="cart-title" style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>
              Your shopping bag is empty
            </h1>
            <p style={{ fontSize: '1rem', color: '#4b5563', maxWidth: '460px', lineHeight: 1.6 }}>
              Add products to your cart before entering shipping details.
            </p>
            <button type="button" className="cart-continue-btn" onClick={() => navigate('/cart')}>
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-shell block w-full min-h-screen">
      <div className="cart-page-inner block max-w-7xl mx-auto">
        <div className="cart-checkout-stepper flex flex-row justify-center items-center w-full" aria-label="Checkout progress">
          <div className="cart-step cart-step-complete flex items-center" style={{ minWidth: '132px' }}>
            <span className="cart-step-circle">1</span>
            <span className="cart-step-label">Cart</span>
          </div>
          <span className="cart-step-connector" aria-hidden="true" />
          <div className="cart-step cart-step-active flex items-center" aria-current="step" style={{ minWidth: '148px' }}>
            <span className="cart-step-circle">2</span>
            <span className="cart-step-label">Shipping</span>
          </div>
          <span className="cart-step-connector" aria-hidden="true" />
          <div className="cart-step flex items-center" style={{ minWidth: '146px' }}>
            <span className="cart-step-circle">3</span>
            <span className="cart-step-label">Payment</span>
          </div>
        </div>

        <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            {!isAddressSaved ? (
              <div className="shipping-form-card">
                <div className="shipping-form-header">
                  <h1>Shipping Details</h1>
                  <p>Enter your delivery address to continue to payment.</p>
                </div>

                <form ref={shippingFormRef} className="shipping-form-grid" onSubmit={handleSubmit}>
                  <div className="shipping-field shipping-field-full">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="Enter your full name" required />
                  </div>

                  <div className="shipping-field">
                    <label htmlFor="mobileNumber">Mobile Number</label>
                    <input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} type="tel" placeholder="10-digit mobile number" required />
                  </div>

                  <div className="shipping-field">
                    <label htmlFor="pincode">Pincode</label>
                    <input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} type="text" placeholder="Pincode" required />
                  </div>

                  <div className="shipping-field">
                    <label htmlFor="stateName">State</label>
                    <input id="stateName" name="stateName" value={formData.stateName} onChange={handleChange} type="text" placeholder="State" required />
                  </div>

                  <div className="shipping-field">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" required />
                  </div>

                  <div className="shipping-field shipping-field-full">
                    <label htmlFor="houseNo">House No./Building</label>
                    <input id="houseNo" name="houseNo" value={formData.houseNo} onChange={handleChange} type="text" placeholder="House no. / Building / Apartment" required />
                  </div>

                  <div className="shipping-field shipping-field-full">
                    <label htmlFor="roadName">Road Name/Area</label>
                    <textarea id="roadName" name="roadName" value={formData.roadName} onChange={handleChange} placeholder="Road name, area, landmark" rows="3" required />
                  </div>

                  <div className="shipping-form-actions shipping-field-full">
                    <button type="submit" className="shipping-submit-btn">
                      Deliver Here
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="shipping-form-card shipping-address-card">
                <div className="shipping-form-header">
                  <h1>Delivery Address</h1>
                  <p>Your saved shipping details for this order.</p>
                </div>

                <div className="shipping-address-summary">
                  <div className="shipping-address-top">
                    <div>
                      <h2>{formData.fullName}</h2>
                      <p>{formData.mobileNumber}</p>
                    </div>
                    <button type="button" className="shipping-change-btn" onClick={() => setIsAddressSaved(false)}>
                      Change
                    </button>
                  </div>

                  <p className="shipping-address-line">{formattedAddress}</p>
                </div>

                <div className="shipping-form-actions shipping-field-full">
                  <button type="button" className="shipping-submit-btn" onClick={() => navigate('/checkout', {
                    state: {
                      cartItems,
                      total: grandTotal,
                      shippingAddress: formData,
                    },
                  })}>
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="cart-summary-card block lg:col-span-1">
            <h3>Price Details</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>₹ {subtotal.toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
            <div className="cart-summary-row grand-total">
              <span>Grand Total</span>
              <strong>₹ {grandTotal.toFixed(2)}</strong>
            </div>

            <button type="button" className="cart-checkout-btn" onClick={handleSidebarAction}>
              {isAddressSaved ? 'Proceed to Payment' : 'Deliver Here'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

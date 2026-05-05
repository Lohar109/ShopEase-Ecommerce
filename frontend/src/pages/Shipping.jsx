import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';
import './Shipping.css';
import Stepper from '../components/Stepper';

const Shipping = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedAddress = window.localStorage.getItem('shopease_address');
    if (!savedAddress) return;

    try {
      const parsedAddress = JSON.parse(savedAddress);
      setFormData((current) => ({ ...current, ...parsedAddress }));
      setIsAddressSaved(true);
    } catch {
      window.localStorage.removeItem('shopease_address');
    }
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [cartItems]
  );
  const platformFee = 250;
  const memberDiscount = -5000;
  const newGrandTotal = subtotal + platformFee + memberDiscount;
  const savingsAmount = Math.abs(memberDiscount) - platformFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSaveAddress = (event) => {
    event.preventDefault();
    if (cartItems.length === 0) return;
    const addressData = formData;
    window.localStorage.setItem('shopease_address', JSON.stringify(addressData));
    setIsAddressSaved(true);
  };

  const handleSidebarAction = () => {
    // If address isn't saved yet, validate and save it from the left form.
    if (!isAddressSaved) {
      const required = ['fullName', 'mobileNumber', 'pincode', 'stateName', 'city', 'houseNo', 'roadName'];
      const isFormValid = required.every((k) => formData[k] && String(formData[k]).trim() !== '');
      if (!isFormValid) {
        alert('Please complete all address fields before saving.');
        return;
      }
      const addressData = formData;
      window.localStorage.setItem('shopease_address', JSON.stringify(addressData));
      setIsAddressSaved(true);
      return;
    }

    // Address is saved — proceed to Payment step.
    navigate('/checkout/payment', {
      state: {
        cartItems,
        total: newGrandTotal,
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
        <Stepper currentStep={2} />

        <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            {!isAddressSaved ? (
              <div className="shipping-form-card">
                <div className="shipping-form-header">
                  <h1>Shipping Details</h1>
                  <p>Enter your delivery address to continue to payment.</p>
                </div>

                <form className="shipping-form-grid" onSubmit={handleSaveAddress}>
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
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
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
                  </div>

                  <div className="shipping-form-card shipping-order-summary">
                    <div className="shipping-form-header">
                      <h3>Order Summary</h3>
                    </div>

                    <div className="order-items-list">
                      {cartItems.map((item, idx) => {
                        const src = item.image || item.thumbnail || (item.images && item.images[0]);
                        const key = item.id || item._id || item.sku || item.name || idx;
                        return (
                          <div className="order-item-row" key={key}>
                            {src ? (
                              <img src={src} alt={item.name} className="order-item-thumb" />
                            ) : (
                              <div className="order-item-thumb order-item-thumb--empty" />
                            )}

                            <div className="order-item-meta">
                              <div className="order-item-name">{item.name && item.name.length > 48 ? `${item.name.slice(0, 45)}...` : item.name}</div>
                              <div className="order-item-qty-price">Qty: {item.quantity} • ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </>
            )}
          </div>

          <aside className="cart-summary-card block lg:col-span-1">
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
              <ShieldCheck size={16} aria-hidden="true" />
              <span>You've saved ₹{savingsAmount.toFixed(2)} on this order!</span>
            </div>

            <button type="button" className="cart-checkout-btn shipping-payment-btn" onClick={handleSidebarAction}>
              {!isAddressSaved ? 'Save Address' : 'Continue to Payment'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

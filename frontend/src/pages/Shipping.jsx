import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck } from 'lucide-react';
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
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
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

    navigate('/checkout/summary', {
      state: {
        cartItems,
        shippingAddress: formData,
        deliveryMethod,
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
                  <p>Enter your delivery address to continue to order review.</p>
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

                <div className="shipping-form-card shipping-delivery-card">
                  <div className="shipping-form-header">
                    <h3>Delivery Method</h3>
                    <p>Choose how quickly you want your order delivered.</p>
                  </div>

                  <div className="delivery-method-list" role="radiogroup" aria-label="Delivery method">
                    <button
                      type="button"
                      className={`delivery-method-option${deliveryMethod === 'standard' ? ' selected' : ''}`}
                      onClick={() => setDeliveryMethod('standard')}
                    >
                      <div className="delivery-method-top">
                        <strong>Standard</strong>
                        <span>5-7 business days</span>
                      </div>
                      <div className="delivery-method-price">Free</div>
                    </button>

                    <button
                      type="button"
                      className={`delivery-method-option${deliveryMethod === 'express' ? ' selected' : ''}`}
                      onClick={() => setDeliveryMethod('express')}
                    >
                      <div className="delivery-method-top">
                        <strong>Express</strong>
                        <span>2-3 business days</span>
                      </div>
                      <div className="delivery-method-price">₹149</div>
                    </button>
                  </div>

                  <p className="delivery-method-note">
                    <Truck size={14} strokeWidth={2.1} aria-hidden="true" />
                    <span>Delivery speed can be changed before payment on the review page.</span>
                  </p>
                </div>
              </>
            )}
          </div>

          <aside className="cart-summary-card block lg:col-span-1">
            <h3>Next Step</h3>
            <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.6 }}>
              Review your items and pricing on the order summary page before proceeding to payment.
            </p>

            <button type="button" className="cart-checkout-btn shipping-payment-btn" onClick={handleSidebarAction}>
              {!isAddressSaved ? 'Save Address' : 'Continue to Order Summary'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

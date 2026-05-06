import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Shipping.css';
import Stepper from '../components/Stepper';

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
  const shippingAddress = state?.shippingAddress || JSON.parse(window.localStorage.getItem('shopease_address') || 'null') || {};
  const deliveryMethod = state?.deliveryMethod || 'standard';

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cartItems]
  );
  const platformFee = 250;
  const deliveryFee = deliveryMethod === 'express' ? 149 : 0;
  const discount = -5000;
  const grandTotal = subtotal + platformFee + deliveryFee + discount;
  const savingsAmount = Math.abs(discount) - platformFee - deliveryFee;

  const formattedAddress = [
    shippingAddress.fullName,
    shippingAddress.mobileNumber,
    shippingAddress.houseNo,
    shippingAddress.roadName,
    shippingAddress.city,
    shippingAddress.stateName,
    shippingAddress.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="cart-page-shell block w-full min-h-screen">
      <div className="cart-page-inner block max-w-7xl mx-auto">
        <Stepper currentStep={3} />

        <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            <div className="shipping-form-card shipping-address-card">
              <div className="shipping-form-header">
                <h1>Order Summary</h1>
                <p>Review your shipping details and cart items before payment.</p>
              </div>

              <div className="shipping-address-summary">
                <div className="shipping-address-top">
                  <div>
                    <h2>Shipping Address</h2>
                    <p>{shippingAddress.fullName || 'No address saved yet'}</p>
                  </div>
                  <button type="button" className="shipping-change-btn" onClick={() => navigate('/checkout/shipping', { state })}>
                    Edit
                  </button>
                </div>

                <p className="shipping-address-line">
                  {formattedAddress || 'Please go back to shipping and save your address.'}
                </p>
                <p className="shipping-address-line" style={{ color: '#6b7280' }}>
                  Delivery method: {deliveryMethod === 'express' ? 'Express' : 'Standard'}
                </p>
              </div>
            </div>

            <div className="shipping-form-card shipping-order-summary">
              <div className="shipping-form-header">
                <h3>Items in Your Cart</h3>
                <p>All items that will be included in this order.</p>
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
                        <div className="order-item-name">
                          {item.name && item.name.length > 48 ? `${item.name.slice(0, 45)}...` : item.name}
                        </div>
                        <div className="order-item-qty-price">
                          Qty: {item.quantity} • ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                Delivery Fee <Truck size={14} aria-hidden="true" />
              </span>
              <span>₹ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-title">
                Discount <ChevronDown size={14} aria-hidden="true" />
              </span>
              <strong className="cart-summary-discount">-₹ {Math.abs(discount).toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row grand-total">
              <span>Grand Total</span>
              <strong>₹ {grandTotal.toFixed(2)}</strong>
            </div>

            <div className="cart-savings-box" role="status" aria-live="polite">
              <ShieldCheck size={22} aria-hidden="true" />
              <span>You've saved ₹{savingsAmount.toFixed(2)} on this order!</span>
            </div>

            <button type="button" className="cart-checkout-btn shipping-payment-btn">
              Continue to Payment
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

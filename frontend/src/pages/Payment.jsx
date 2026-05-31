import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Truck, Info, ShieldCheck, Check, Tag, Headphones, MessageSquare, Lock, ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';
import './Shipping.css';
import './Payment.css';
import Stepper from '../components/Stepper';

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
  const deliveryMethod = state?.deliveryMethod || 'standard';

  // Selected Payment Method State
  const [selectedMethod, setSelectedMethod] = useState('card'); // upi, card, netbanking, wallets, bnpl, gpay



  // Dynamic pricing calculations
  const { totalMRP, totalDiscount, totalQty } = useMemo(() => {
    let mrpAccum = 0;
    let discAccum = 0;
    let qtyAccum = 0;

    cartItems.forEach((item) => {
      const qty = Number(item.quantity || 1);
      qtyAccum += qty;
      const originalPrice = Number(item.mrp ?? item.price ?? 0);
      mrpAccum += originalPrice * qty;

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

      discAccum += savingsPerUnit * qty;
    });

    return { totalMRP: mrpAccum, totalDiscount: discAccum, totalQty: qtyAccum };
  }, [cartItems]);

  const platformFee = totalMRP > 0 ? 250 : 0;
  const deliveryFee = deliveryMethod === 'sameday' ? 249 : (deliveryMethod === 'express' ? 149 : 0);
  const grandTotal = totalMRP + platformFee + deliveryFee - totalDiscount;

  const handlePay = () => {
    // Mock successful payment
    alert(`Payment of ₹${grandTotal.toFixed(2)} successful using ${selectedMethod.replace('_', ' ').toUpperCase()}! Thank you for your order.`);
    navigate('/');
  };

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
              Add products to your cart before proceeding to payment.
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
        <Stepper currentStep={4} />

        <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Main Column: Payment Methods & Details */}
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            

            {/* 100% Secure Payments Alert banner */}
            <div className="payment-security-alert-box">
              <div className="security-alert-left">
                <div className="security-alert-shield-wrap">
                  <ShieldCheck size={18} strokeWidth={2.5} />
                </div>
                <div className="security-alert-text">
                  <strong>100% Secure Payments</strong>
                  <p>Your payment information is encrypted and safe with us.</p>
                </div>
              </div>
              
              <div className="security-alert-right">
                <span className="secured-by-label">Secured by</span>
                <span className="razorpay-logo-badge">Razorpay</span>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="payment-methods-sub-section other-methods">
              <h3>Payment Methods</h3>

              <div className="payment-methods-grid">
                
                {/* Option 1: UPI */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('upi')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'upi' ? 'checked' : ''}`}>
                    {selectedMethod === 'upi' && <span className="address-radio-checked-dot" />}
                  </span>
                  
                  <div className="method-cell-icon-wrap upi">
                    <div className="upi-triangle-illustration">
                      <span className="triangle-node apex" />
                      <span className="triangle-node left-base" />
                      <span className="triangle-node right-base" />
                    </div>
                  </div>

                  <div className="method-cell-text">
                    <strong>UPI</strong>
                    <p>Pay using any UPI app</p>
                  </div>

                  <span className="instant-badge">Instant</span>
                </div>

                {/* Option 2: Credit / Debit / ATM Card */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'card' ? 'checked' : ''}`}>
                    {selectedMethod === 'card' && <span className="address-radio-checked-dot" />}
                  </span>

                  <div className="method-cell-icon-wrap mastercard">
                    <div className="mastercard-circles">
                      <span className="circle left-orange" />
                      <span className="circle right-red" />
                    </div>
                  </div>

                  <div className="method-cell-text">
                    <strong>Credit / Debit / ATM Card</strong>
                    <p>Pay using any card</p>
                  </div>

                  <span className="instant-badge">Instant</span>
                </div>

                {/* Option 3: Net Banking */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'netbanking' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('netbanking')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'netbanking' ? 'checked' : ''}`}>
                    {selectedMethod === 'netbanking' && <span className="address-radio-checked-dot" />}
                  </span>

                  <div className="method-cell-icon-wrap netbanking">
                    <span className="banking-pillar left" />
                    <span className="banking-pillar middle" />
                    <span className="banking-pillar right" />
                    <span className="banking-roof" />
                  </div>

                  <div className="method-cell-text">
                    <strong>Net Banking</strong>
                    <p>Pay using your preferred bank</p>
                  </div>

                  <span className="instant-badge">Instant</span>
                </div>

                {/* Option 4: Wallets */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'wallets' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('wallets')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'wallets' ? 'checked' : ''}`}>
                    {selectedMethod === 'wallets' && <span className="address-radio-checked-dot" />}
                  </span>

                  <div className="method-cell-icon-wrap wallets">
                    <span className="paytm-brand-tag">Paytm</span>
                  </div>

                  <div className="method-cell-text">
                    <strong>Wallets</strong>
                    <p>Pay using Paytm, PhonePe, Amazon Pay & more</p>
                  </div>

                  <span className="instant-badge">Instant</span>
                </div>

                {/* Option 5: Buy Now, Pay Later */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'bnpl' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('bnpl')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'bnpl' ? 'checked' : ''}`}>
                    {selectedMethod === 'bnpl' && <span className="address-radio-checked-dot" />}
                  </span>

                  <div className="method-cell-icon-wrap simpl">
                    <span className="simpl-dot" />
                    <span className="simpl-text-label">Simpl</span>
                  </div>

                  <div className="method-cell-text">
                    <strong>Buy Now, Pay Later</strong>
                    <p>Pay in easy EMIs</p>
                  </div>

                  <span className="emi-badge">EMI Available</span>
                </div>

                {/* Option 6: Google Pay */}
                <div 
                  className={`payment-method-grid-cell ${selectedMethod === 'gpay' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('gpay')}
                >
                  <span className={`address-radio-circle ${selectedMethod === 'gpay' ? 'checked' : ''}`}>
                    {selectedMethod === 'gpay' && <span className="address-radio-checked-dot" />}
                  </span>

                  <div className="method-cell-icon-wrap gpay">
                    <span className="gpay-brand-first">G</span>
                    <span className="gpay-brand-second">Pay</span>
                  </div>

                  <div className="method-cell-text">
                    <strong>Google Pay</strong>
                    <p>Pay quickly & securely</p>
                  </div>

                  <span className="instant-badge">Instant</span>
                </div>

              </div>
            </div>

            {/* Order Items Summary Card */}
            <div className="shipping-form-card checkout-items-summary-card" style={{ marginTop: '2rem' }}>
              <div className="order-summary-sidebar-header" style={{ marginBottom: '1.25rem' }}>
                <h3>Order Summary</h3>
                <span className="items-count-badge">{totalQty} {totalQty === 1 ? 'Item' : 'Items'}</span>
              </div>

              <div className="sidebar-items-scroller" style={{ maxHeight: 'none' }}>
                {cartItems.map((item, idx) => {
                  const src = item.image || item.thumbnail || (item.images && item.images[0]);
                  const key = item.id || item._id || item.sku || item.name || idx;
                  
                  return (
                    <div className="sidebar-product-row" key={key} style={{ padding: '10px 0', borderBottom: idx < cartItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div className="sidebar-product-thumb-wrap">
                        {src ? (
                          <img src={src} alt={item.name} className="sidebar-product-thumb" />
                        ) : (
                          <div className="sidebar-product-thumb--empty" />
                        )}
                      </div>
                      
                      <div className="sidebar-product-info">
                        <p className="sidebar-product-title" style={{ fontSize: '0.88rem', fontWeight: '600' }}>{item.name}</p>
                        <p className="sidebar-product-quantity">Qty: {item.quantity}</p>
                      </div>
                      
                      <div className="sidebar-product-price" style={{ fontSize: '0.9rem' }}>
                        ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="cart-summary-column block lg:col-span-1">
            <div className="cart-summary-card">
              
              {/* Summary Header */}
              <div className="order-summary-sidebar-header">
                <h3>Price Details</h3>
              </div>

              {/* Price Details */}
              <div className="cart-summary-row">
                <span>Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                <strong>₹{totalMRP.toFixed(2)}</strong>
              </div>
              
              <div className="cart-summary-row">
                <span className="fee-label-with-icon">
                  Platform Fee <Info size={13} className="fee-info-icon" />
                </span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              
              <div className="cart-summary-row">
                <span className="shipping-label-with-icon">
                  Shipping <Truck size={13} className="shipping-truck-icon" />
                </span>
                <span className={deliveryFee === 0 ? "shipping-free-label" : ""}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              
              <div className="cart-summary-row">
                <span>Discount</span>
                <strong className="cart-summary-discount">-₹{totalDiscount.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-row-divider" />

              <div className="cart-summary-row grand-total-row">
                <span>Grand Total</span>
                <strong>₹{grandTotal.toFixed(2)}</strong>
              </div>

              {/* Savings Toast */}
              <div className="cart-savings-toast-box">
                <div className="savings-check-badge">
                  <Check size={10} color="#ffffff" strokeWidth={3} />
                </div>
                <span>You're saving ₹{totalDiscount.toFixed(2)} on this order!</span>
              </div>

              {/* Pay Button & Policies footer */}
              <div className="payment-page-pay-action-block">
                <button 
                  type="button" 
                  className="cart-checkout-btn payment-cta-pay-btn"
                  onClick={handlePay}
                >
                  <Lock size={14} className="pay-lock-icon" /> Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
                
                <p className="payment-footer-policy-links">
                  By proceeding, you agree to our <span>Terms & Conditions</span> and <span>Privacy Policy</span>.
                </p>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;

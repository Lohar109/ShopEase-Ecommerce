import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  const { cartItems: cartItemsFromContext, clearCart } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
  const deliveryMethod = state?.deliveryMethod || 'standard';

  // Selected Payment Method State
  const [selectedMethod, setSelectedMethod] = useState('card'); // upi, card, netbanking, wallets, bnpl, gpay
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);



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
    const generatedOrderId = "#SE" + Math.floor(100000000 + Math.random() * 900000000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    
    // Create new order entries (one for each product in the cart)
    const newOrders = cartItems.map(item => ({
      orderId: generatedOrderId,
      orderDate: formattedDate,
      paymentMethod: "Paid via " + selectedMethod.toUpperCase(),
      totalAmount: grandTotal,
      status: "Processing",
      productName: item.productName || item.name,
      productDesc: item.productDesc || item.description || "",
      quantity: item.quantity || 1,
      statusDetail: "Processing",
      statusDetailSub: "Will be shipped soon",
      imageUrl: item.image || item.main_image || ""
    }));

    // Prepend to current orders list in localStorage
    const savedOrdersStr = localStorage.getItem("shopease_orders_list");
    let currentOrders = [];
    if (savedOrdersStr) {
      try {
        const parsed = JSON.parse(savedOrdersStr);
        // ignore default mock ones
        const isDefaultList = Array.isArray(parsed) && parsed.length > 0 && parsed.every(o => o.orderId && o.orderId.startsWith("#SE123"));
        if (!isDefaultList) {
          currentOrders = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const updatedOrders = [...newOrders, ...currentOrders];
    localStorage.setItem("shopease_orders_list", JSON.stringify(updatedOrders));

    // Calculate points earned (1 point per ₹1 spent, rounded down)
    const pointsEarnedThisPurchase = Math.floor(grandTotal);

    // Update Available Points in localStorage
    const savedAvailPointsStr = localStorage.getItem("shopease_available_points");
    const currentAvailPoints = (savedAvailPointsStr && savedAvailPointsStr !== "750") ? parseInt(savedAvailPointsStr, 10) : 0;
    const newAvailPoints = currentAvailPoints + pointsEarnedThisPurchase;
    localStorage.setItem("shopease_available_points", newAvailPoints.toString());

    // Update Points Earned in localStorage
    const savedEarnedPointsStr = localStorage.getItem("shopease_points_earned");
    const currentEarnedPoints = (savedEarnedPointsStr && savedEarnedPointsStr !== "1250") ? parseInt(savedEarnedPointsStr, 10) : 0;
    const newEarnedPoints = currentEarnedPoints + pointsEarnedThisPurchase;
    localStorage.setItem("shopease_points_earned", newEarnedPoints.toString());

    // Append to Rewards Activities
    const savedActivitiesStr = localStorage.getItem("shopease_rewards_activities");
    let currentActivities = [];
    if (savedActivitiesStr) {
      try {
        const parsed = JSON.parse(savedActivitiesStr);
        if (Array.isArray(parsed)) {
          currentActivities = parsed.filter(a => {
            if (!a || !a.desc) return false;
            const desc = String(a.desc);
            return !(desc.includes("Amazon Pay") || desc.includes("#SE123") || desc.includes("Welcome Bonus"));
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activityDate = `${String(now.getDate()).padStart(2, '0')} ${monthsShort[now.getMonth()]} ${now.getFullYear()}`;
    const newActivity = {
      date: activityDate,
      desc: `Order ${generatedOrderId}`,
      points: pointsEarnedThisPurchase,
      status: "Credited"
    };
    const updatedActivities = [newActivity, ...currentActivities];
    localStorage.setItem("shopease_rewards_activities", JSON.stringify(updatedActivities));

    // Clear the cart
    clearCart();

    // Show Success screen with specific purchase data
    setSuccessData({
      orderId: generatedOrderId,
      date: formattedDate,
      amount: grandTotal,
      pointsEarned: pointsEarnedThisPurchase
    });
    setIsSuccess(true);
  };

  if (isSuccess && successData) {
    return (
      <div className="cart-page-shell block w-full min-h-screen">
        <div className="cart-page-inner block max-w-2xl mx-auto" style={{ paddingTop: '3rem', paddingBottom: '3rem', fontFamily: 'Poppins, sans-serif' }}>
          <div className="payment-success-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            {/* Animated Success Badge */}
            <div className="success-icon-wrap" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#10b981'
            }}>
              <ShieldCheck size={48} strokeWidth={2} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Thank you for shopping with us. Your order details are below.
            </p>

            {/* Purchase Details */}
            <div className="purchase-details-box" style={{
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Order ID</span>
                <strong style={{ color: '#111827', fontSize: '0.9rem' }}>{successData.orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Date & Time</span>
                <span style={{ color: '#111827', fontSize: '0.9rem' }}>{successData.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Payment Status</span>
                <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>Success</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Total Amount Paid</span>
                <strong style={{ color: '#111827', fontSize: '0.95rem' }}>₹{successData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Points Earned UI - Matching the Available Points style */}
            <div className="points-earned-card" style={{
              background: 'linear-gradient(135deg, #fff5f6 0%, #fdf2f8 100%)',
              border: '1px dashed #f472b6',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#fce7f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#db2777',
                marginBottom: '0.75rem'
              }}>
                <Tag size={20} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#db2777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Points Earned
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#db2777', margin: '0.25rem 0' }}>
                {successData.pointsEarned}
              </h2>
              <span style={{ fontSize: '0.9rem', color: '#db2777', fontWeight: '500' }}>
                Worth ₹{(successData.pointsEarned * 0.1).toFixed(2)}
              </span>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem', maxWidth: '320px', lineHeight: 1.4 }}>
                These points have been added to your profile rewards. You can convert them into Rupees instantly at any time.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/profile?tab=rewards')}
                style={{
                  background: '#db2777',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.target.style.background = '#be185d'}
                onMouseOut={(e) => e.target.style.background = '#db2777'}
              >
                Go to Rewards
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{
                  background: '#ffffff',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                onMouseOut={(e) => e.target.style.background = '#ffffff'}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  By proceeding, you agree to our <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
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

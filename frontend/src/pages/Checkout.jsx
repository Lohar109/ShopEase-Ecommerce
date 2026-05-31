import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Edit2, ShoppingBag, Tag, Info, Truck, ShieldCheck, Check, ChevronDown, RotateCcw, Award
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Shipping.css';
import Stepper from '../components/Stepper';

const FALLBACK_ADDRESS = {
  fullName: 'Rohan Sharma',
  mobileNumber: '+91 98765 43210',
  houseNo: 'A-501, Green Valley Apartments',
  roadName: 'Bannerghatta Road',
  city: 'Bengaluru',
  stateName: 'Karnataka',
  pincode: '560076',
  isDefault: true
};

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;
  const shippingAddress = state?.shippingAddress || JSON.parse(window.localStorage.getItem('shopease_address') || 'null') || FALLBACK_ADDRESS;
  const deliveryMethod = state?.deliveryMethod || 'standard';

  // Address variables
  const activeAddress = Object.keys(shippingAddress).length > 0 ? shippingAddress : FALLBACK_ADDRESS;

  // Dynamic pricing
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

  const formattedAddress = [
    activeAddress.houseNo,
    activeAddress.roadName,
    activeAddress.city,
    activeAddress.stateName,
    activeAddress.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const handlePlaceOrder = () => {
    toast.success("Order Placed Successfully!");
    // Clear cart or redirect
  };

  return (
    <div className="cart-page-shell block w-full min-h-screen">
      <div className="cart-page-inner block max-w-7xl mx-auto">
        <Stepper currentStep={3} />

        <div className="cart-content grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Delivery Address & Cart Items */}
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            
            {/* Header Text */}
            <div className="shipping-page-header">
              <h1>Review Your Order</h1>
              <p>Review your items, delivery address, and price details before payment</p>
            </div>

            {/* Card 1: Delivery Address */}
            <div className="shipping-form-card checkout-address-summary-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title-left">
                  <MapPin size={18} className="pdp-location-icon" />
                  <h2>Delivery Address</h2>
                </div>
                
                <button 
                  type="button" 
                  className="checkout-header-edit-btn" 
                  onClick={() => navigate('/checkout/shipping', { state })}
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>

              <div className="checkout-address-body">
                <div className="address-meta-row">
                  <span className="address-name">{activeAddress.fullName}</span>
                  {activeAddress.isDefault && <span className="default-badge">Default</span>}
                </div>
                <p className="checkout-address-block-text">
                  {formattedAddress}
                </p>
                <p className="checkout-address-phone-text">
                  Phone: <strong>{activeAddress.mobileNumber}</strong>
                </p>
              </div>
            </div>

            {/* Card 2: Items list */}
            <div className="shipping-form-card checkout-items-summary-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title-left">
                  <ShoppingBag size={18} className="pdp-shopping-bag-icon" />
                  <h2>Items ({totalQty})</h2>
                </div>

                <button 
                  type="button" 
                  className="checkout-header-edit-btn" 
                  onClick={() => navigate('/cart')}
                >
                  <Edit2 size={13} /> Edit Cart
                </button>
              </div>

              <div className="checkout-order-items-list">
                {cartItems.map((item, idx) => {
                  const src = item.image || item.thumbnail || (item.images && item.images[0]);
                  const key = item.id || item._id || item.sku || item.name || idx;

                  // Unit price and discount calculations
                  const qty = Number(item.quantity || 1);
                  const originalPrice = Number(item.mrp ?? item.price ?? 0);
                  
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

                  const sellingPrice = originalPrice - savingsPerUnit;

                  return (
                    <div className="checkout-order-item-row" key={key}>
                      <div className="checkout-item-thumb-wrap">
                        {src ? (
                          <img src={src} alt={item.productName || item.name} className="checkout-item-thumb" />
                        ) : (
                          <div className="checkout-item-thumb--empty" />
                        )}
                      </div>

                      <div className="checkout-item-meta">
                        <h4 className="checkout-item-name">{item.productName || item.name}</h4>
                        <div className="checkout-item-attributes">
                          {item.size && <span>{item.size}</span>}
                          {item.size && item.color && <span className="attr-divider">|</span>}
                          {item.color && <span>{item.color}</span>}
                          {!item.size && !item.color && <span>Standard Edition</span>}
                        </div>
                      </div>

                      <div className="checkout-item-pricing-column">
                        <span className="checkout-item-qty">Qty: {qty}</span>
                        <strong className="checkout-item-total-price">
                          ₹{(sellingPrice * qty).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Price Details & Proceed button */}
          <div className="cart-summary-column block lg:col-span-1">
            <div className="cart-summary-card">
              
              {/* Sidebar header */}
              <div className="checkout-sidebar-price-header">
                <Tag size={16} className="price-tag-icon" />
                <h3>Price Details</h3>
              </div>

              {/* Price Details Breakdown */}
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

              {/* Savings Box */}
              <div className="cart-savings-toast-box">
                <div className="savings-check-badge">
                  <Check size={10} color="#ffffff" strokeWidth={3} />
                </div>
                <span>You're saving ₹{totalDiscount.toFixed(2)} on this order!</span>
              </div>

              {/* Main Action button */}
              <button 
                type="button" 
                className="cart-checkout-btn" 
                onClick={handlePlaceOrder}
              >
                Proceed to Payment
              </button>
            </div>

            {/* Horizontal Trust Row bottom of sidebar */}
            <div className="sidebar-horizontal-trust-card">
              <div className="inline-trust-badge">
                <div className="inline-trust-icon-circle">
                  <Truck size={14} />
                </div>
                <strong>Free Shipping</strong>
                <p>On all orders above ₹499</p>
              </div>

              <div className="inline-trust-badge">
                <div className="inline-trust-icon-circle">
                  <RotateCcw size={14} />
                </div>
                <strong>Easy Returns</strong>
                <p>7 days return policy</p>
              </div>

              <div className="inline-trust-badge">
                <div className="inline-trust-icon-circle">
                  <ShieldCheck size={14} />
                </div>
                <strong>Secure Payments</strong>
                <p>100% safe & trusted</p>
              </div>

              <div className="inline-trust-badge">
                <div className="inline-trust-icon-circle">
                  <Award size={14} />
                </div>
                <strong>Top Quality</strong>
                <p>Premium quality products</p>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;

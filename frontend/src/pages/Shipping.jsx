import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Truck, Plus, Edit2, Trash2, ShieldCheck, Info, X, ChevronDown, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';
import './Shipping.css';
import Stepper from '../components/Stepper';

const DEFAULT_ADDRESSES = [
  {
    id: 'addr_1',
    fullName: 'Rohan Sharma',
    mobileNumber: '+91 98765 43210',
    houseNo: '#42/1, 2nd Main, 8th Cross',
    roadName: 'Koramangala',
    city: 'Bengaluru (Bangalore)',
    stateName: 'Karnataka',
    pincode: '560034',
    type: 'HOME',
    isDefault: true
  },
  {
    id: 'addr_2',
    fullName: 'Rohan Sharma',
    mobileNumber: '+91 81234 56789',
    houseNo: 'Tech Park, Block C, 5th Floor',
    roadName: 'Whitefield Main Road',
    city: 'Bengaluru',
    stateName: 'Karnataka',
    pincode: '560066',
    type: 'WORK',
    isDefault: false
  }
];

const Shipping = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems: cartItemsFromContext } = useCart();

  const cartItems = state?.cartItems?.length ? state.cartItems : cartItemsFromContext;

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('shopease_saved_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADDRESSES;
      }
    }
    return DEFAULT_ADDRESSES;
  });

  // Selected Address State
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    return defaultAddress ? defaultAddress.id : '';
  });

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState('standard'); // standard, express, sameday

  // Modal State for Address Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null means adding a new address
  const [modalFormData, setModalFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    stateName: '',
    city: '',
    houseNo: '',
    roadName: '',
    type: 'HOME'
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('shopease_saved_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Keep currently active address saved under the original single address key for backwards compatibility
  useEffect(() => {
    const activeAddress = addresses.find(a => a.id === selectedAddressId);
    if (activeAddress) {
      localStorage.setItem('shopease_address', JSON.stringify(activeAddress));
    }
  }, [selectedAddressId, addresses]);

  // Pricing Calculations
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

  const platformFee = 250;
  const deliveryFee = deliveryMethod === 'sameday' ? 249 : (deliveryMethod === 'express' ? 149 : 0);
  const grandTotal = totalMRP + platformFee + deliveryFee - totalDiscount;

  // Free shipping progress logic (subtotal threshold is ₹499)
  const isFreeShippingUnlocked = totalMRP >= 499;
  const freeShippingProgressPercentage = isFreeShippingUnlocked ? 100 : Math.min(100, (totalMRP / 499) * 100);

  // Modal Actions
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setModalFormData({
      fullName: '',
      mobileNumber: '',
      pincode: '',
      stateName: '',
      city: '',
      houseNo: '',
      roadName: '',
      type: 'HOME'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setModalFormData({
      fullName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      pincode: addr.pincode,
      stateName: addr.stateName,
      city: addr.city,
      houseNo: addr.houseNo,
      roadName: addr.roadName,
      type: addr.type || 'HOME'
    });
    setIsModalOpen(true);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (editingAddress) {
      // Edit existing
      setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...modalFormData } : addr));
    } else {
      // Add new
      const newAddr = {
        id: `addr_${Date.now()}`,
        ...modalFormData,
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
    }
    setIsModalOpen(false);
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation(); // prevent selecting deleted address
    const filtered = addresses.filter(addr => addr.id !== id);
    setAddresses(filtered);

    // Re-adjust selection if deleted address was selected
    if (selectedAddressId === id && filtered.length > 0) {
      const def = filtered.find(a => a.isDefault) || filtered[0];
      setSelectedAddressId(def.id);
    } else if (filtered.length === 0) {
      setSelectedAddressId('');
    }
  };

  const handleContinue = () => {
    const activeAddress = addresses.find(a => a.id === selectedAddressId);
    if (!activeAddress) {
      alert('Please add and select a delivery address first.');
      return;
    }

    navigate('/checkout/summary', {
      state: {
        cartItems,
        shippingAddress: activeAddress,
        deliveryMethod,
      },
    });
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
          
          {/* Left Main Column: Shipping Addresses & Delivery Options */}
          <div className="shipping-form-shell cart-list block lg:col-span-2">
            

            {/* Saved Addresses Card */}
            <div className="shipping-form-card saved-addresses-card-wrap">
              <div className="saved-addresses-header">
                <h2>Saved Addresses</h2>
                <button type="button" className="add-new-address-link" onClick={handleOpenAddModal}>
                  <Plus size={14} /> Add New Address
                </button>
              </div>

              <div className="saved-addresses-list">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  return (
                    <div 
                      key={addr.id} 
                      className={`saved-address-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      {/* Left: Radio check dot */}
                      <div className="address-item-radio-wrap">
                        <span className={`address-radio-circle ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <span className="address-radio-checked-dot" />}
                        </span>
                      </div>

                      {/* Middle: Details */}
                      <div className="address-item-details-wrap">
                        <div className="address-meta-row">
                          <span className={`address-badge ${addr.type?.toLowerCase() === 'work' ? 'work' : 'home'}`}>
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        
                        <h3 className="address-name">{addr.fullName}</h3>
                        <p className="address-block">
                          {addr.houseNo}, {addr.roadName}, {addr.city} - {addr.pincode}, {addr.stateName} - India
                        </p>
                        <p className="address-phone">
                          Phone: <strong>{addr.mobileNumber}</strong>
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="address-item-actions-wrap">
                        <button 
                          type="button" 
                          className="address-action-btn edit" 
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(addr); }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          type="button" 
                          className="address-action-btn delete" 
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}

                {addresses.length === 0 && (
                  <div className="empty-addresses-state">
                    <p>No saved addresses found. Please add a new delivery address to proceed.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Method Selection */}
            <div className="shipping-form-card shipping-delivery-card">
              <div className="shipping-form-header shipping-form-header-compact">
                <h3>Shipping Method</h3>
              </div>

              <div className="delivery-method-list" role="radiogroup" aria-label="Delivery method">
                
                {/* Option 1: FREE Delivery */}
                <button
                  type="button"
                  className={`delivery-method-option${deliveryMethod === 'standard' ? ' selected' : ''}`}
                  onClick={() => setDeliveryMethod('standard')}
                >
                  <div className="delivery-method-left">
                    <div className="delivery-method-icon-circle standard">
                      <Truck size={16} />
                    </div>
                    <div className="delivery-method-top">
                      <strong>FREE Delivery</strong>
                      <span>Delivery in 3-5 business days</span>
                    </div>
                  </div>
                  <div className="delivery-method-price free">FREE</div>
                </button>

                {/* Option 2: Express Delivery */}
                <button
                  type="button"
                  className={`delivery-method-option${deliveryMethod === 'express' ? ' selected' : ''}`}
                  onClick={() => setDeliveryMethod('express')}
                >
                  <div className="delivery-method-left">
                    <div className="delivery-method-icon-circle express">
                      <Truck size={16} />
                    </div>
                    <div className="delivery-method-top">
                      <strong>Express Delivery</strong>
                      <span>Delivery in 1-2 business days</span>
                    </div>
                  </div>
                  <div className="delivery-method-price">₹149.00</div>
                </button>

                {/* Option 3: Same Day Delivery */}
                <button
                  type="button"
                  className={`delivery-method-option${deliveryMethod === 'sameday' ? ' selected' : ''}`}
                  onClick={() => setDeliveryMethod('sameday')}
                >
                  <div className="delivery-method-left">
                    <div className="delivery-method-icon-circle sameday">
                      <Truck size={16} />
                    </div>
                    <div className="delivery-method-top">
                      <strong>Same Day Delivery</strong>
                      <span>Order before 2 PM</span>
                    </div>
                  </div>
                  <div className="delivery-method-price">₹249.00</div>
                </button>
              </div>
            </div>


          </div>

          {/* Right Sidebar: Order Summary & Inline Trust Badges */}
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

              {/* Continue Button */}
              <button 
                type="button" 
                className="cart-checkout-btn" 
                onClick={handleContinue}
              >
                Proceed to Checkout
              </button>
            </div>


          </div>

        </div>
      </div>

      {/* Address Form Glassmorphic Modal */}
      {isModalOpen && (
        <div className="cart-offers-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cart-offers-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="cart-offers-modal-header">
              <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button type="button" className="cart-offers-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="address-modal-form">
              <div className="address-modal-body">
                <div className="modal-field-group">
                  <div className="modal-field full-width">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={modalFormData.fullName} 
                      onChange={handleModalInputChange} 
                      placeholder="Enter full name" 
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <div className="modal-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      name="mobileNumber" 
                      value={modalFormData.mobileNumber} 
                      onChange={handleModalInputChange} 
                      placeholder="10-digit mobile number" 
                      required 
                    />
                  </div>

                  <div className="modal-field">
                    <label>Pincode</label>
                    <input 
                      type="text" 
                      name="pincode" 
                      value={modalFormData.pincode} 
                      onChange={handleModalInputChange} 
                      placeholder="6-digit pincode" 
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <div className="modal-field">
                    <label>State</label>
                    <input 
                      type="text" 
                      name="stateName" 
                      value={modalFormData.stateName} 
                      onChange={handleModalInputChange} 
                      placeholder="State name" 
                      required 
                    />
                  </div>

                  <div className="modal-field">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={modalFormData.city} 
                      onChange={handleModalInputChange} 
                      placeholder="City name" 
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <div className="modal-field full-width">
                    <label>House No. / Building</label>
                    <input 
                      type="text" 
                      name="houseNo" 
                      value={modalFormData.houseNo} 
                      onChange={handleModalInputChange} 
                      placeholder="House No., Building Name, Apartment" 
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <div className="modal-field full-width">
                    <label>Road Name / Area</label>
                    <textarea 
                      name="roadName" 
                      value={modalFormData.roadName} 
                      onChange={handleModalInputChange} 
                      placeholder="Road name, area, colony, landmark" 
                      rows={3}
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <div className="modal-field full-width">
                    <label>Address Type</label>
                    <div className="address-type-selector">
                      <button 
                        type="button" 
                        className={`type-option ${modalFormData.type === 'HOME' ? 'active' : ''}`}
                        onClick={() => setModalFormData(p => ({ ...p, type: 'HOME' }))}
                      >
                        HOME
                      </button>
                      <button 
                        type="button" 
                        className={`type-option ${modalFormData.type === 'WORK' ? 'active' : ''}`}
                        onClick={() => setModalFormData(p => ({ ...p, type: 'WORK' }))}
                      >
                        WORK
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="address-modal-footer">
                <button type="button" className="address-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="address-modal-submit-btn">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shipping;

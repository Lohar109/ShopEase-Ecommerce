import React from 'react';
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const { state } = useLocation();
  const cartItems = state?.cartItems || [];
  const total = Number(state?.total || 0);

  return (
    <div style={{ maxWidth: '900px', margin: '24px auto', padding: '0 16px 32px' }}>
      <h1 style={{ marginBottom: '12px', color: '#111827' }}>Checkout</h1>
      <p style={{ color: '#4b5563', marginBottom: '14px' }}>
        This is a placeholder checkout page.
      </p>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <p style={{ marginBottom: '6px' }}>Items: {cartItems.length}</p>
        <p style={{ fontWeight: 600 }}>Total: ₹ {total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Checkout;

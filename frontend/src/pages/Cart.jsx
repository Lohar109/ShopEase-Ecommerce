import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout', { state: { cartItems, total } });
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map(item => (
              <div className="cart-item" key={item.cartItemId}>
                <img src={item.image} alt={item.productName} className="cart-item-image" />

                <div className="cart-item-details">
                  <h3>{item.productName}</h3>
                  <p>Size: {item.size || 'N/A'}</p>
                  <p>Price: ₹ {item.price ?? 'N/A'}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                  </div>
                  <button type="button" className="cart-remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="cart-summary">
        <span>Total</span>
        <strong>₹ {total.toFixed(2)}</strong>
      </div>

      <button
        type="button"
        className="cart-checkout-btn"
        disabled={cartItems.length === 0}
        onClick={handleCheckout}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;

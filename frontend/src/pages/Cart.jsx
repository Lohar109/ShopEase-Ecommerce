import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const deliveryFee = 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout', { state: { cartItems, total: grandTotal } });
  };

  const handleDecrease = (item) => {
    updateQuantity(item.cartItemId, item.quantity - 1);
    toast('Cart updated', { icon: '🛒' });
  };

  const handleIncrease = (item) => {
    updateQuantity(item.cartItemId, item.quantity + 1);
    toast('Cart updated', { icon: '🛒' });
  };

  const handleRemove = (item) => {
    removeFromCart(item.cartItemId);
    toast('Item removed', { icon: '🗑️' });
  };

  return (
    <div className="w-full min-h-screen px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="cart-title">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div
            className="cart-empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center'
            }}
          >
            <p className="cart-empty-heading">Your Cart is Empty</p>
            <button type="button" className="cart-continue-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-list">
              {cartItems.map(item => (
                <div className="cart-item" key={item.cartItemId}>
                  <Link to={`/product/${item.productId}`} className="cart-item-image-link">
                    <img src={item.image} alt={item.productName} className="cart-item-image" />
                  </Link>

                  <div className="cart-item-details">
                    <h3>
                      <Link to={`/product/${item.productId}`} className="cart-item-title-link">
                        {item.productName}
                      </Link>
                    </h3>
                    <p>Size: {item.size || 'N/A'}</p>
                    <p>Color: {item.color || 'N/A'}</p>
                    <p>Price: ₹ {item.price ?? 'N/A'}</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-control">
                      <button type="button" onClick={() => handleDecrease(item)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => handleIncrease(item)}>+</button>
                    </div>
                    <button type="button" className="cart-remove-btn" onClick={() => handleRemove(item)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary-card">
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

              <button
                type="button"
                className="cart-checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

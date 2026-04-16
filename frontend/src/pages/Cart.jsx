import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
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
        {cartItems.length === 0 ? (
          <div
            className="cart-empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              textAlign: 'center',
              gap: '12px',
              fontFamily: "Poppins, sans-serif"
            }}
          >
            <ShoppingBag
              size={82}
              strokeWidth={1.5}
              color="#d1d5db"
              aria-hidden="true"
              style={{
                marginBottom: '6px'
              }}
            />
            <h1
              className="cart-title"
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1a1a1a',
                textAlign: 'center',
                marginBottom: '2px'
              }}
            >
              Your shopping bag is empty
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: '#4b5563',
                maxWidth: '460px',
                lineHeight: 1.6,
                marginBottom: '1.6rem'
              }}
            >
              Looks like you have not added anything yet. Explore our latest collection and find pieces worth carrying home.
            </p>
            <button
              type="button"
              className="cart-continue-btn"
              style={{ marginTop: '4px' }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <h1
              className="cart-title"
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1a1a1a',
                textAlign: 'center'
              }}
            >
              Your Cart
            </h1>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

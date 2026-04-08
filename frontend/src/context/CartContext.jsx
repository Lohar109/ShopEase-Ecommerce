import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cartItems';

const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);

  const addToCart = (product, selectedVariant) => {
    if (!product?.id || !selectedVariant?.id) return;

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.productId === product.id && item.variantId === selectedVariant.id
      );

      if (existingIndex !== -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const cartItemId = `${product.id}-${selectedVariant.id}`;
      return [
        ...prevItems,
        {
          cartItemId,
          productId: product.id,
          variantId: selectedVariant.id,
          productName: product.name,
          image: selectedVariant.image || product.main_image || '',
          size: selectedVariant.size || null,
          price: selectedVariant.price ?? null,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

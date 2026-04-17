import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = 'wishlistProductIds';

const loadWishlistFromStorage = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(loadWishlistFromStorage);

  const syncWishlistFromStorage = useCallback(() => {
    const fromStorage = loadWishlistFromStorage();
    setWishlist((prev) => {
      if (prev.length === fromStorage.length && prev.every((id, idx) => id === fromStorage[idx])) {
        return prev;
      }
      return fromStorage;
    });
  }, []);

  const toggleWishlist = (productId) => {
    const normalizedId = String(productId);
    setWishlist((prevList) =>
      prevList.includes(normalizedId)
        ? prevList.filter((id) => id !== normalizedId)
        : [...prevList, normalizedId]
    );
  };

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo(
    () => ({ wishlist, toggleWishlist, clearWishlist, syncWishlistFromStorage }),
    [wishlist, clearWishlist, syncWishlistFromStorage]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
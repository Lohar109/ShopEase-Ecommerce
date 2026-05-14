import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const AdminContext = createContext(null);

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

const parseJsonResponse = async (response) => {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const normalizeCollection = (data) => (Array.isArray(data) ? data : []);

const useCollectionHelpers = (setCollection) => {
  const addItem = useCallback((item) => {
    if (!item || item.id == null) return;
    setCollection((prev) => [...prev, item]);
  }, [setCollection]);

  const updateItem = useCallback((updatedItem) => {
    if (!updatedItem || updatedItem.id == null) return;
    const nextId = String(updatedItem.id);
    setCollection((prev) =>
      prev.map((item) => (String(item.id) === nextId ? updatedItem : item))
    );
  }, [setCollection]);

  const deleteItem = useCallback((itemOrId) => {
    const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
    if (id == null) return;
    const normalizedId = String(id);
    setCollection((prev) => prev.filter((item) => String(item.id) !== normalizedId));
  }, [setCollection]);

  return { addItem, updateItem, deleteItem };
};

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const loadedRef = useRef({
    products: false,
    categories: false,
    audiences: false,
    coupons: false,
  });

  const productActions = useCollectionHelpers(setProducts);
  const categoryActions = useCollectionHelpers(setCategories);
  const audienceActions = useCollectionHelpers(setAudiences);
  const couponActions = useCollectionHelpers(setCoupons);

  const getProducts = useCallback(async () => {
    if (loadedRef.current.products) return products;
    const data = await requestJson(`${API_BASE_URL}/products`);
    const nextProducts = normalizeCollection(data);
    setProducts(nextProducts);
    loadedRef.current.products = true;
    return nextProducts;
  }, [products]);

  const getCategories = useCallback(async () => {
    if (loadedRef.current.categories) return categories;
    const data = await requestJson(`${API_BASE_URL}/categories`);
    const nextCategories = normalizeCollection(data);
    setCategories(nextCategories);
    loadedRef.current.categories = true;
    return nextCategories;
  }, [categories]);

  const getAudiences = useCallback(async () => {
    if (loadedRef.current.audiences) return audiences;
    const data = await requestJson(`${API_BASE_URL}/audiences`);
    const nextAudiences = normalizeCollection(data);
    setAudiences(nextAudiences);
    loadedRef.current.audiences = true;
    return nextAudiences;
  }, [audiences]);

  const getCoupons = useCallback(async () => {
    if (loadedRef.current.coupons) return coupons;
    const data = await requestJson(`${API_BASE_URL}/coupons`);
    const nextCoupons = normalizeCollection(data);
    setCoupons(nextCoupons);
    loadedRef.current.coupons = true;
    return nextCoupons;
  }, [coupons]);

  const value = useMemo(() => ({
    products,
    categories,
    audiences,
    coupons,
    getProducts,
    getCategories,
    getAudiences,
    getCoupons,
    addProduct: productActions.addItem,
    updateProduct: productActions.updateItem,
    deleteProduct: productActions.deleteItem,
    addCategory: categoryActions.addItem,
    updateCategory: categoryActions.updateItem,
    deleteCategory: categoryActions.deleteItem,
    addAudience: audienceActions.addItem,
    updateAudience: audienceActions.updateItem,
    deleteAudience: audienceActions.deleteItem,
    addCoupon: couponActions.addItem,
    updateCoupon: couponActions.updateItem,
    deleteCoupon: couponActions.deleteItem,
  }), [
    products,
    categories,
    audiences,
    coupons,
    getProducts,
    getCategories,
    getAudiences,
    getCoupons,
    productActions.addItem,
    productActions.updateItem,
    productActions.deleteItem,
    categoryActions.addItem,
    categoryActions.updateItem,
    categoryActions.deleteItem,
    audienceActions.addItem,
    audienceActions.updateItem,
    audienceActions.deleteItem,
    couponActions.addItem,
    couponActions.updateItem,
    couponActions.deleteItem,
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

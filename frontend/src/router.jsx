import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import ProductDetail from "./components/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Shipping from "./pages/Shipping";
import Wishlist from "./pages/Wishlist";
import Shop from "./pages/Shop";
import Payment from "./pages/Payment";
import Login from "./pages/Login";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout/shipping" element={<Shipping />} />
    <Route path="/checkout/payment" element={<Payment />} />
    <Route path="/checkout/summary" element={<Checkout />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/login" element={<Login />} />
  </Routes>
);

export default AppRouter;

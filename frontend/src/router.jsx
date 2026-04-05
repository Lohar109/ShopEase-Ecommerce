import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import ProductDetail from "./components/ProductDetail";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

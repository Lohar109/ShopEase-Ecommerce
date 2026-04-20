
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
      </Routes>
    </Router>
  );
}

export default App;

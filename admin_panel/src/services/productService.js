// src/services/productService.js
// Handles product API calls for admin panel

const API_BASE_URL = 'http://localhost:5000/api'; // Update if your backend URL is different

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Save a new product (with variants)
export async function saveProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save product');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// src/services/categoryService.js
// Fetches categories for the admin panel

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;


export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Add a new category
export async function addCategory({ name, image = null, parent_id = null }) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image, parent_id })
    });
    if (!response.ok) {
      throw new Error('Failed to add category');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

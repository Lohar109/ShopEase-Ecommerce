// src/services/authService.js
// Handles authentication API calls for admin panel

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

const TOKEN_STORAGE_KEY = 'shopease_admin_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginAdmin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data; // Should include token or admin info
  } catch (error) {
    throw error;
  }
}

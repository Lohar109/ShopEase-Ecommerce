// src/services/dashboardService.js
// Handles dashboard stats API calls for admin panel

import { getAuthHeaders } from './authService';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const requestError = new Error(error.error || error.message || 'Failed to fetch dashboard stats');
      requestError.status = response.status;
      throw requestError;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

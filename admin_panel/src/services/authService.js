// src/services/authService.js
// Handles authentication API calls for admin panel

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your backend URL if different

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

import { getAuthHeaders } from './authService';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

export async function fetchAudiences() {
  const response = await fetch(`${API_BASE_URL}/audiences`);
  if (!response.ok) {
    throw new Error('Failed to fetch audiences');
  }
  return response.json();
}

export async function addAudience({ name }) {
  const response = await fetch(`${API_BASE_URL}/audiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    let parsed = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
    throw new Error(parsed?.error || 'Failed to add audience');
  }

  return response.json();
}

export async function updateAudience(id, { name }) {
  const response = await fetch(`${API_BASE_URL}/audiences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    let parsed = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
    throw new Error(parsed?.error || 'Failed to update audience');
  }

  return response.json();
}

export async function deleteAudience(id) {
  const response = await fetch(`${API_BASE_URL}/audiences/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    let parsed = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
    throw new Error(parsed?.error || 'Failed to delete audience');
  }

  return response.json();
}
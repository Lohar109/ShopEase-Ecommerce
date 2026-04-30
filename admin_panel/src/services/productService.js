// src/services/productService.js
// Handles product API calls for admin panel

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

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

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
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
      const requestError = new Error(error.error || 'Failed to save product');
      requestError.sku = error.sku;
      requestError.status = response.status;
      throw requestError;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      const requestError = new Error(error.error || 'Failed to update product');
      requestError.sku = error.sku;
      requestError.status = response.status;
      throw requestError;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateProductStatus(id, statusData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });

    const raw = await response.text();
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const message = parsed?.error || parsed?.message || `Failed to update product status (HTTP ${response.status})`;
      throw new Error(message);
    }
    return parsed || { ok: true };
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchDesignGalleries(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/design-gallery/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch design galleries');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function saveDesignGallery(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/design-gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save design gallery');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteDesignGallery(galleryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/design-gallery/${galleryId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete design gallery');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

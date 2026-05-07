const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

const parseJson = async (response) => {
  const raw = await response.text();
  return raw ? JSON.parse(raw) : null;
};

export async function fetchCoupons() {
  const response = await fetch(`${API_BASE_URL}/coupons`);
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to fetch coupons');
  }
  return Array.isArray(data) ? data : [];
}

export async function createCoupon(payload) {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to create coupon');
  }
  return data;
}

export async function updateCoupon(id, payload) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to update coupon');
  }
  return data;
}

export async function updateCouponStatus(id, isActive) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive })
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to update coupon status');
  }
  return data;
}

export async function deleteCoupon(id) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'DELETE'
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to delete coupon');
  }
  return data;
}

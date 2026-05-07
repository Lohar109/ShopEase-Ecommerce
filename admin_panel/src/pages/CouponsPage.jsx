import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
  updateCouponStatus
} from '../services/couponService';

const DEFAULT_FORM = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  expiry_date: '',
  description: ''
};

const ToggleSwitch = ({ value, onToggle, disabled }) => {
  const trackStyle = {
    position: 'relative',
    width: 48,
    height: 24,
    borderRadius: 999,
    border: 'none',
    background: value ? '#22c55e' : '#ef4444',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 300ms ease',
    opacity: disabled ? 0.6 : 1,
    padding: 0
  };

  const thumbStyle = {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transform: value ? 'translateX(24px)' : 'translateX(0)',
    transition: 'all 300ms ease'
  };

  const labelStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.3,
    right: value ? 'auto' : 7,
    left: value ? 7 : 'auto'
  };

  return (
    <button type="button" onClick={onToggle} disabled={disabled} style={trackStyle}>
      <span style={labelStyle}>{value ? 'YES' : 'NO'}</span>
      <span style={thumbStyle} />
    </button>
  );
};

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17, 24, 39, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(720px, 96vw)',
          borderRadius: 16,
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: '#111827' }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f3f4f6',
              color: '#374151',
              borderRadius: 999,
              width: 30,
              height: 30,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
};

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [form, setForm] = useState(DEFAULT_FORM);

  const sortedCoupons = useMemo(() => (
    [...coupons].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
  ), [coupons]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchCoupons();
        setCoupons(data);
      } catch (err) {
        setError(err.message || 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetAndClose = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setForm(DEFAULT_FORM);
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: Number(coupon.discount_value || 0),
      min_order_value: Number(coupon.min_order_value || 0),
      expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 10) : '',
      description: coupon.description || ''
    });
    setShowModal(true);
  };

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!String(form.code || '').trim()) return 'Coupon code is required';
    if (!Number.isFinite(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
      return 'Discount value must be greater than 0';
    }
    if (!Number.isFinite(Number(form.min_order_value)) || Number(form.min_order_value) < 0) {
      return 'Minimum order value cannot be negative';
    }
    if (!form.expiry_date) return 'Expiry date is required';
    return null;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      code: String(form.code || '').trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value),
      expiry_date: form.expiry_date,
      description: form.description || ''
    };

    try {
      setSaving(true);
      if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.id, payload);
        setCoupons((prev) => prev.map((coupon) => (coupon.id === editingCoupon.id ? updated : coupon)));
        toast.success('Coupon updated');
      } else {
        const created = await createCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        toast.success('Coupon added');
      }
      resetAndClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    const nextValue = !coupon.is_active;
    setUpdatingStatus((prev) => ({ ...prev, [coupon.id]: true }));
    setCoupons((prev) => prev.map((item) => (item.id === coupon.id ? { ...item, is_active: nextValue } : item)));

    try {
      const updated = await updateCouponStatus(coupon.id, nextValue);
      setCoupons((prev) => prev.map((item) => (item.id === coupon.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setCoupons((prev) => prev.map((item) => (item.id === coupon.id ? { ...item, is_active: coupon.is_active } : item)));
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [coupon.id]: false }));
    }
  };

  const handleDelete = async (couponId) => {
    const confirmed = window.confirm('Delete this coupon?');
    if (!confirmed) return;

    try {
      setDeletingId(couponId);
      await deleteCoupon(couponId);
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== couponId));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return <div style={{ color: '#dc2626', padding: 24 }}>{error}</div>;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e4e4e7',
        padding: 30,
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ fontWeight: 600, letterSpacing: '0.3px', margin: 0, color: '#111' }}>
          Coupon Management
        </h2>
        <button
          type="button"
          onClick={openAddModal}
          style={{
            height: '42px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '0 18px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Add Coupon
        </button>
      </div>

      <div style={{ overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Discount</th>
              <th style={thStyle}>Min Spend</th>
              <th style={thStyle}>Expiry</th>
              <th style={thStyle}>Active</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && sortedCoupons.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 18, color: '#6b7280' }}>
                  No coupons found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 18, color: '#6b7280' }}>
                  Loading coupons...
                </td>
              </tr>
            )}

            {!loading && sortedCoupons.map((coupon) => (
              <tr key={coupon.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>{coupon.code}</td>
                <td style={tdStyle}>
                  {coupon.discount_type === 'percentage' ? `${Number(coupon.discount_value).toFixed(0)}%` : `₹${Number(coupon.discount_value).toFixed(2)}`}
                </td>
                <td style={tdStyle}>₹{Number(coupon.min_order_value).toFixed(2)}</td>
                <td style={tdStyle}>{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <ToggleSwitch
                    value={Boolean(coupon.is_active)}
                    onToggle={() => handleToggleActive(coupon)}
                    disabled={Boolean(updatingStatus[coupon.id])}
                  />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(coupon)}
                      style={iconButtonStyle}
                      aria-label="Edit coupon"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id)}
                      style={iconButtonStyle}
                      aria-label="Delete coupon"
                      disabled={deletingId === coupon.id}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showModal}
        title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
        onClose={resetAndClose}
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 14 }}>
          <div style={fieldGridStyle}>
            <label style={labelStyle}>
              Coupon Code
              <input
                type="text"
                value={form.code}
                onChange={(event) => onChange('code', event.target.value.toUpperCase())}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              Discount Type
              <select
                value={form.discount_type}
                onChange={(event) => onChange('discount_type', event.target.value)}
                style={inputStyle}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </label>
          </div>

          <div style={fieldGridStyle}>
            <label style={labelStyle}>
              Discount Value
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discount_value}
                onChange={(event) => onChange('discount_value', event.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              Minimum Order Value
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_value}
                onChange={(event) => onChange('min_order_value', event.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>

          <label style={labelStyle}>
            Expiry Date
            <input
              type="date"
              value={form.expiry_date}
              onChange={(event) => onChange('expiry_date', event.target.value)}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelStyle}>
            Description / Notes
            <textarea
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
              style={{ ...inputStyle, minHeight: 92, resize: 'vertical' }}
              placeholder="non-returnable"
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={resetAndClose} style={secondaryBtnStyle}>Cancel</button>
            <button type="submit" disabled={saving} style={primaryBtnStyle}>
              {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const thStyle = {
  textAlign: 'left',
  fontSize: 12,
  letterSpacing: 0.4,
  color: '#6b7280',
  fontWeight: 700,
  padding: '12px 14px'
};

const tdStyle = {
  padding: '12px 14px',
  fontSize: 13,
  color: '#111827'
};

const iconButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid #e4e4e7',
  background: '#ffffff',
  color: '#111827',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12
};

const labelStyle = {
  display: 'grid',
  gap: 6,
  color: '#374151',
  fontSize: 13,
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  outline: 'none'
};

const primaryBtnStyle = {
  border: 'none',
  borderRadius: 10,
  background: '#111827',
  color: '#fff',
  padding: '10px 14px',
  fontWeight: 600,
  cursor: 'pointer'
};

const secondaryBtnStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 10,
  background: '#fff',
  color: '#111827',
  padding: '10px 14px',
  fontWeight: 600,
  cursor: 'pointer'
};

export default CouponsPage;

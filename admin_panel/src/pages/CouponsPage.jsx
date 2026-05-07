import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteCoupon, fetchCoupons, updateCouponStatus } from '../services/couponService';

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

const CouponsPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

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
          onClick={() => navigate('/coupons/new')}
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
                      onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
                      style={iconButtonStyle}
                      aria-label="Edit coupon"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id)}
                      style={deleteIconButtonStyle}
                      aria-label="Delete coupon"
                      disabled={deletingId === coupon.id}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = '#fee2e2';
                        event.currentTarget.style.borderColor = '#fca5a5';
                        event.currentTarget.style.color = '#b91c1c';
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = '#fef2f2';
                        event.currentTarget.style.borderColor = '#fecaca';
                        event.currentTarget.style.color = '#dc2626';
                      }}
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
  cursor: 'pointer',
  transition: 'all 200ms ease'
};

const deleteIconButtonStyle = {
  ...iconButtonStyle,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#dc2626'
};

export default CouponsPage;

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, CalendarDays, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createCoupon, fetchCouponById, updateCoupon } from '../services/couponService';
import { fetchCategories } from '../services/categoryService';
import CategoryMultiSelect from '../components/CategoryMultiSelect';

const STEPS = [
  { key: 'general', label: 'General' },
  { key: 'rules', label: 'Rules' },
  { key: 'limits', label: 'Limits' }
];

const DEFAULT_FORM = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  expiry_date: '',
  description: '',
  applicable_categories: []
};

const CouponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(isEditMode);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    const loadCoupon = async () => {
      try {
        setLoadingCoupon(true);
        setLoadError('');
        const coupon = await fetchCouponById(id);
        setForm({
          code: coupon.code || '',
          discount_type: coupon.discount_type || 'percentage',
          discount_value: Number(coupon.discount_value || 0),
          min_order_value: Number(coupon.min_order_value || 0),
          expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 10) : '',
          description: coupon.description || '',
          applicable_categories: Array.isArray(coupon.applicable_categories) ? coupon.applicable_categories : []
        });
      } catch (err) {
        setLoadError(err.message || 'Failed to load coupon');
      } finally {
        setLoadingCoupon(false);
      }
    };

    loadCoupon();
  }, [id, isEditMode]);

  const activeIdx = Math.max(0, STEPS.findIndex((s) => s.key === activeTab));
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < STEPS.length - 1;

  const stepDone = useMemo(() => ({
    general: Boolean(String(form.code || '').trim()),
    rules: Boolean(form.discount_type && Number(form.discount_value) > 0 && Number(form.min_order_value) >= 0 && form.expiry_date),
    limits: false
  }), [form]);

  const validateCurrentStep = () => {
    if (activeTab === 'general') {
      if (!String(form.code || '').trim()) return 'Coupon code is required';
      return null;
    }

    if (activeTab === 'rules') {
      if (!Number.isFinite(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
        return 'Discount value must be greater than 0';
      }
      if (!Number.isFinite(Number(form.min_order_value)) || Number(form.min_order_value) < 0) {
        return 'Minimum order value cannot be negative';
      }
      if (!form.expiry_date) return 'Expiry date is required';
      return null;
    }

    return null;
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      toast.error(err);
      return;
    }

    if (canNext) {
      setActiveTab(STEPS[activeIdx + 1].key);
      return;
    }

    // final step -> submit
    handleSave({ preventDefault: () => {} });
  };

  const handleBack = () => {
    if (canPrev) {
      setActiveTab(STEPS[activeIdx - 1].key);
    }
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
      if (isEditMode) {
        await updateCoupon(id, payload);
        toast.success('Coupon updated');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created');
      }
      // Reset form fields
      setForm(DEFAULT_FORM);
      setActiveTab('general');
      navigate('/coupons');
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return <div style={{ color: '#dc2626', marginTop: 30, textAlign: 'center' }}>{loadError}</div>;
  }

  if (loadingCoupon) {
    return <div style={{ color: '#6b7280', marginTop: 30, textAlign: 'center' }}>Loading coupon...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#fafafa', borderRadius: 16 }}>
      <style>{`
        .cf-outline-accent-btn {
          transition: all 0.2s ease;
          background: #ffffff;
          color: #c8507a;
          border: 1px solid #c8507a;
          border-radius: 10px;
          height: 42px;
          width: 42px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cf-outline-accent-btn:hover {
          background: #fff1f6;
        }
        .pf-ghost-action-btn {
          height: 40px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fff1f2;
          color: #dc2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pf-ghost-action-btn:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

      `}</style>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 120,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '12px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
          borderBottom: '1px solid #f4f4f5'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', minWidth: 0 }}>
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            style={{
              border: 'none',
              height: 36,
              padding: '0 12px',
              borderRadius: 10,
              background: '#111827',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <h2 style={{ margin: 0, justifySelf: 'center', fontSize: 24, fontWeight: 700, color: '#18181b', letterSpacing: '-0.02em' }}>
          {isEditMode ? 'Edit Coupon' : 'Add New Coupon'}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULT_FORM);
              setActiveTab('general');
              navigate('/coupons');
            }}
            disabled={saving}
            className="pf-ghost-action-btn"
            style={{ padding: '0 14px' }}
          >
            Discard
          </button>

          <button
            type="submit"
            form="coupon-form"
            disabled={saving}
            style={{
              background: saving ? '#888' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              height: 40,
              padding: '0 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {saving ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '36px auto 0', padding: '0 20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
          <aside
            style={{
              position: 'sticky',
              top: 86,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #eceff3',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              padding: '18px 16px',
              alignSelf: 'start'
            }}
          >
            {STEPS.map((step, idx) => {
              const completed = Boolean(stepDone[step.key]);
              const active = idx === activeIdx;
              const lineColor = completed ? '#86efac' : '#e4e4e7';

              return (
                <div key={step.key} style={{ position: 'relative', paddingBottom: idx < STEPS.length - 1 ? 26 : 0 }}>
                  {idx < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 15,
                        top: 32,
                        width: 1,
                        height: 26,
                        background: lineColor
                      }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab(step.key)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: completed ? '1px solid #bbf7d0' : active ? 'none' : '1px solid #d4d4d8',
                        background: completed ? '#f0fdf4' : active ? '#c8507a' : '#f4f4f5',
                        color: completed ? '#16a34a' : active ? '#ffffff' : '#9ca3af',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0
                      }}
                    >
                      {completed ? <Check size={16} /> : idx + 1}
                    </span>

                      <span style={{ fontSize: 14, fontWeight: active ? 700 : completed ? 600 : 500, color: active ? '#111827' : completed ? '#374151' : '#9ca3af' }}>
                        {step.label}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </aside>

          <section>
            <div style={sectionCardStyle}>
              <form id="coupon-form" onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
                <section style={{ display: activeTab === 'general' ? 'block' : 'none' }}>
                  <div style={sectionTitleWrapStyle}>
                    <span style={sectionIconStyle}><Info size={16} /></span>
                    <h4 style={sectionTitleStyle}>General Details</h4>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>
                      Coupon Code
                      <input
                        type="text"
                        value={form.code}
                        onChange={(event) => onChange('code', event.target.value.toUpperCase())}
                        style={inputStyle}
                        placeholder="SAVE100"
                        required
                      />
                    </label>
                  </div>

                  <label style={labelStyle}>
                    Description / Notes
                    <textarea
                      value={form.description}
                      onChange={(event) => onChange('description', event.target.value)}
                      style={textareaStyle}
                      placeholder="non-returnable"
                    />
                  </label>
                </section>

                <section style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
                  <div style={sectionTitleWrapStyle}>
                    <span style={sectionIconStyle}><Info size={16} /></span>
                    <h4 style={sectionTitleStyle}>Discount Rules</h4>
                  </div>

                  <div style={fieldGridStyle}>
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
                  </div>

                  <div style={fieldGridStyle}>
                    <label style={labelStyle}>
                      Min Order Value
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

                    <label style={labelStyle}>
                      Expiry Date
                      <span style={{ position: 'relative' }}>
                        <input
                          type="date"
                          value={form.expiry_date}
                          onChange={(event) => onChange('expiry_date', event.target.value)}
                          style={dateInputStyle}
                          required
                        />
                        <CalendarDays size={16} style={calendarIconStyle} />
                      </span>
                    </label>
                  </div>
                </section>

                <section style={{ display: activeTab === 'limits' ? 'block' : 'none' }}>
                  <div style={sectionTitleWrapStyle}>
                    <span style={sectionIconStyle}><Info size={16} /></span>
                    <h4 style={sectionTitleStyle}>Limits</h4>
                  </div>

                  <label style={labelStyle}>
                    Applicable Categories (optional)
                    <CategoryMultiSelect
                      categories={categories}
                      value={form.applicable_categories || []}
                      onChange={(ids) => onChange('applicable_categories', ids)}
                      placeholder="Search and select categories..."
                      loading={loadingCategories}
                    />
                  </label>
                </section>
              </form>

              <div style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #eef0f3', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={!canPrev}
                  style={{
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d4d4d8',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: canPrev ? 'pointer' : 'not-allowed',
                    opacity: canPrev ? 1 : 0.5,
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  {canNext ? 'Next' : saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const sectionCardStyle = {
  background: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid #eceff3',
  padding: '34px 36px',
  overflow: 'visible'
};

const sectionTitleWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18
};

const sectionIconStyle = {
  width: 30,
  height: 30,
  borderRadius: 8,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #f3d1dc',
  background: '#fff1f6',
  color: '#c8507a'
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  color: '#111'
};

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginBottom: 16
};

const labelStyle = {
  display: 'grid',
  gap: 6,
  color: '#374151',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #a0a0a0',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'Poppins, sans-serif',
  outline: 'none'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 120,
  resize: 'vertical',
  lineHeight: 1.5
};

const dateInputStyle = {
  ...inputStyle,
  paddingRight: 40
};

const calendarIconStyle = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6b7280',
  pointerEvents: 'none'
};

const chipWrapStyle = {
  marginTop: 12,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8
};

const chipStyle = {
  border: '1px solid #f3d1dc',
  background: '#fff1f6',
  color: '#8b1e4b',
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8
};

const chipRemoveBtnStyle = {
  border: 'none',
  background: 'transparent',
  color: '#8b1e4b',
  fontSize: 16,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0
};

export default CouponForm;

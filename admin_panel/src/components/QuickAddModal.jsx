import React from 'react';
import { ChevronDown } from 'lucide-react';

const QuickAddModal = ({
  m,
  title,
  val,
  setVal,
  onClose,
  onAdd,
  loading,
  isSubcategory = false,
  pId = '',
  setPId,
  parentOptions = [],
  canAdd = false,
}) => {
  if (!m) return null;

  const inputLabel = isSubcategory ? 'Subcategory Name' : 'Category Name';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15, 23, 42, 0.22)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#0f172a',
          borderRadius: 14,
          border: '1px solid #1f2937',
          boxShadow: '0 20px 52px rgba(2, 6, 23, 0.48)',
          padding: 20,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>{title}</h4>

        {isSubcategory && (
          <div style={{ marginTop: 14, marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.02em' }}>
              Parent Category
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={pId}
                onChange={(e) => setPId?.(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid #334155',
                  padding: '0 40px 0 16px',
                  fontSize: 14,
                  color: '#e2e8f0',
                  boxSizing: 'border-box',
                  background: '#111827',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
              >
                <option value="" disabled hidden>Select parent category</option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.02em' }}>
            {inputLabel}
          </label>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={inputLabel}
          autoFocus
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            border: '1px solid #334155',
            padding: '0 16px',
            fontSize: 14,
            color: '#e2e8f0',
            background: '#111827',
            boxSizing: 'border-box',
          }}
        />
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              height: 38,
              borderRadius: 10,
              border: '1px solid #334155',
              background: '#1f2937',
              color: '#cbd5e1',
              padding: '0 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={loading || !canAdd}
            style={{
              height: 38,
              borderRadius: 10,
              border: '1px solid #c8507a',
              background: '#c8507a',
              color: '#ffffff',
              padding: '0 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !canAdd ? 'not-allowed' : 'pointer',
              opacity: loading || !canAdd ? 0.6 : 1,
            }}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#64748b', letterSpacing: '0.02em' }}>
          Form UI Refined for Sober Aesthetic
        </p>
      </div>
    </div>
  );
};

export default QuickAddModal;

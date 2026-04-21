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

  const s = isSubcategory;
  const p = pId;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15, 23, 42, 0.22)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e4e4e7',
          boxShadow: '0 20px 44px rgba(15, 23, 42, 0.14)',
          padding: 20,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '0.02em' }}>{title}</h4>

        {s && (
          <div style={{ marginTop: 14, marginBottom: 8 }}>
            <div style={{ position: 'relative' }}>
              <select
                value={p}
                onChange={(e) => setPId?.(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  minHeight: 40,
                  borderRadius: 10,
                  border: '1px solid #d4d4d8',
                  padding: '9px 52px 9px 16px',
                  fontSize: 14,
                  lineHeight: '1.3',
                  fontFamily: 'inherit',
                  color: '#111827',
                  boxSizing: 'border-box',
                  background: '#ffffff',
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
                  color: '#71717a',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: s ? 10 : 20 }}>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={s ? 'Subcategory Name' : 'Category Name'}
          autoFocus
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            border: '1px solid #d4d4d8',
            padding: '0 16px',
            fontSize: 14,
            color: '#111827',
            background: '#ffffff',
            boxSizing: 'border-box',
          }}
        />
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              height: 38,
              borderRadius: 10,
              border: '1px solid #e4e4e7',
              background: 'transparent',
              color: '#4b5563',
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
      </div>
    </div>
  );
};

export default QuickAddModal;

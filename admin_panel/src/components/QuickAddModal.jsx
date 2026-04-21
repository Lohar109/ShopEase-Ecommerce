import React from 'react';

const QuickAddModal = ({ m, title, val, setVal, onClose, onAdd, loading }) => {
  if (!m) return null;

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
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e4e4e7',
          boxShadow: '0 16px 44px rgba(15, 23, 42, 0.16)',
          padding: 18,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h4>
        <p style={{ margin: '6px 0 12px', fontSize: 13, color: '#71717a' }}>Enter a name to quickly add it.</p>

        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Name"
          autoFocus
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            border: '1px solid #d4d4d8',
            padding: '0 12px',
            fontSize: 14,
            color: '#111827',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              height: 38,
              borderRadius: 10,
              border: '1px solid #e4e4e7',
              background: '#ffffff',
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
            disabled={loading || !val.trim()}
            style={{
              height: 38,
              borderRadius: 10,
              border: '1px solid #c8507a',
              background: '#c8507a',
              color: '#ffffff',
              padding: '0 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !val.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !val.trim() ? 0.6 : 1,
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

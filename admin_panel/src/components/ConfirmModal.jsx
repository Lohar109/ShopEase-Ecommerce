import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone. All subcategories under this will also be deleted.',
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={isConfirming ? undefined : onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(17, 24, 39, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 14,
          border: '1px solid #e5e7eb',
          background: '#ffffff',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          padding: '18px 20px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </span>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>{title}</h3>
        </div>

        <p style={{ margin: 0, color: '#4b5563', fontSize: 14, lineHeight: 1.6 }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            style={{
              minWidth: 88,
              height: 36,
              borderRadius: 8,
              border: '1px solid #d4d4d8',
              background: '#ffffff',
              color: '#52525b',
              fontWeight: 600,
              cursor: isConfirming ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            style={{
              minWidth: 88,
              height: 36,
              borderRadius: 8,
              border: '1px solid #dc2626',
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              cursor: isConfirming ? 'not-allowed' : 'pointer',
              opacity: isConfirming ? 0.8 : 1,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

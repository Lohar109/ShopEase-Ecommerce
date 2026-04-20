import React from 'react';
import { LayoutGrid, Package } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Products', path: '/products', Icon: Package },
  { label: 'Categories', path: '/categories', Icon: LayoutGrid },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      style={{
        width: 230,
        minWidth: 230,
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: '20px 12px',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          height: 82,
          padding: '10px 10px 12px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          borderBottom: '1px solid #f1f5f9',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img
            src="/favicon.svg"
            alt="ShopEase"
            style={{ width: 34, height: 34, flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 19, color: '#111827', lineHeight: 1.1 }}>
              ShopEase
            </div>
            <div style={{ marginTop: 2, fontSize: 11, color: '#71717a', fontWeight: 500 }}>
              Control Panel
            </div>
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            borderRadius: 999,
            border: '1px solid #f3d1dc',
            background: '#fff1f6',
            color: '#c8507a',
            fontWeight: 700,
            fontSize: 10,
            padding: '3px 8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Admin
        </div>
      </div>
      <nav style={{ display: 'grid', gap: 8 }}>
        {navItems.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid transparent',
                borderLeft: isActive ? '4px solid #c8507a' : '4px solid transparent',
                background: isActive ? '#c8507a' : 'transparent',
                color: isActive ? '#ffffff' : '#52525b',
                borderRadius: 10,
                padding: '10px 12px',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.3 : 2} color={isActive ? '#ffffff' : '#52525b'} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

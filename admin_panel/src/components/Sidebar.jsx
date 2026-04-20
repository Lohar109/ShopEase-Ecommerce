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
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#111827' }}>
        ShopEase Admin
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
                border: isActive ? '1px solid #111827' : '1px solid transparent',
                background: isActive ? '#111827' : '#f9fafb',
                color: isActive ? '#ffffff' : '#111827',
                borderRadius: 10,
                padding: '10px 12px',
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

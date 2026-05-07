import React from 'react';
import { LayoutGrid, Package, Home, Ticket } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', Icon: Home },
  { label: 'Products', path: '/products', Icon: Package },
  { label: 'Categories', path: '/categories', Icon: LayoutGrid },
  { label: 'Coupons', path: '/coupons', Icon: Ticket },
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
        height: '100%',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
      }}
    >
      <div
        style={{
          height: 82,
          padding: '10px 12px 12px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          borderBottom: '1px solid #f1f5f9',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.07)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#111827', lineHeight: 1.1 }}>
            ShopEase
          </div>
          <div style={{ marginTop: 3, fontSize: 11, color: '#71717a', fontWeight: 500 }}>
            Control Panel
          </div>
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
                border: '0px solid transparent',
                borderLeft: isActive ? '4px solid #c8507a' : '0px solid transparent',
                background: isActive ? 'rgba(200, 80, 122, 0.10)' : 'transparent',
                color: isActive ? '#c8507a' : '#71717a',
                borderRadius: 10,
                padding: '10px 12px',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 200ms ease',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.3 : 2} color={isActive ? '#c8507a' : '#71717a'} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

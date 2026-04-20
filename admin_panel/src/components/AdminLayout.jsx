import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '44px 20px' }}>
      <div style={{ maxWidth: 1450, width: '100%', margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

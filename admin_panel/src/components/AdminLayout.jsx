import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#fafafa', padding: '44px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1450, width: '100%', height: '100%', margin: '0 auto', display: 'flex', gap: 20, alignItems: 'stretch', minHeight: 0 }}>
        <Sidebar />
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

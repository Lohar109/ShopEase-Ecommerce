import React from 'react';
import Sidebar from '../components/Sidebar';

const CategoryPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f6', padding: '60px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: 36,
          }}
        >
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
            Dashboard / Categories
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>
            Category Management
          </h1>
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;

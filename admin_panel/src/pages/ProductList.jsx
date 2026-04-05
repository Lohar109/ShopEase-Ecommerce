import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading products...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '40px 0' }}>
      <div style={{ maxWidth: 950, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, letterSpacing: 1, margin: 0 }}>All Products</h2>
          <button
            onClick={() => navigate('/products/new')}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'background 0.2s',
            }}
          >
            + Add Product
          </button>
        </div>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, padding: 40 }}>No products found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#f5f6fa', borderRadius: 12 }}>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Name</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Brand</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Category</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Active</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Featured</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #eee', fontWeight: 600, color: '#222', fontSize: 16 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ background: '#fff', transition: 'background 0.2s' }}>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.name}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.brand}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.category_name || ''}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.is_active ? 'Yes' : 'No'}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.is_featured ? 'Yes' : 'No'}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

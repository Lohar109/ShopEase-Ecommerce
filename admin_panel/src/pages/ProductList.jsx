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
    <div style={{ minHeight: '100vh', background: '#f4f7f6', padding: '60px 20px' }}>
      <div style={{ maxWidth: 950, margin: '0 auto', background: '#ffffff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, letterSpacing: '0.5px', margin: 0, color: '#111' }}>All Products</h2>
          <button
            onClick={() => navigate('/products/new')}
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            + Add Product
          </button>
        </div>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 16, fontFamily: 'Poppins, sans-serif', padding: 60 }}>No products found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brand</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Featured</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ background: '#fff', borderBottom: '1px solid #f1f3f5', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.brand}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.category_name || ''}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.is_active ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.is_featured ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
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

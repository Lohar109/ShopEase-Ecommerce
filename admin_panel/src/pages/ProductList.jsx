import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { deleteProduct, fetchProducts, updateProductStatus } from '../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);
  const [activeDeleteId, setActiveDeleteId] = useState(null);
  const [updatingToggles, setUpdatingToggles] = useState({});
  const navigate = useNavigate();

  const actionButtonStyle = {
    background: '#000',
    color: '#fff',
    border: '1px solid #000',
    borderRadius: 8,
    padding: '5px 12px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease, border-color 0.2s ease'
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const ToggleSwitch = ({ value, onToggle, disabled }) => {
    const trackStyle = {
      position: 'relative',
      width: 48,
      height: 24,
      borderRadius: 999,
      border: 'none',
      background: value ? '#22c55e' : '#ef4444',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 300ms ease',
      opacity: disabled ? 0.6 : 1,
      padding: 0
    };

    const thumbStyle = {
      position: 'absolute',
      top: 2,
      left: 2,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      transform: value ? 'translateX(24px)' : 'translateX(0)',
      transition: 'all 300ms ease'
    };

    const labelStyle = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#fff',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: 0.3,
      right: value ? 'auto' : 7,
      left: value ? 7 : 'auto'
    };

    return (
      <button type="button" onClick={onToggle} disabled={disabled} style={trackStyle}>
        <span style={labelStyle}>{value ? 'YES' : 'NO'}</span>
        <span style={thumbStyle} />
      </button>
    );
  };

  const handleToggleStatus = async (productId, field) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const nextValue = !product[field];

    setProducts(prev => prev.map(item => item.id === productId ? { ...item, [field]: nextValue } : item));
    setUpdatingToggles(prev => ({ ...prev, [productId]: true }));

    try {
      await updateProductStatus(productId, { [field]: nextValue });
    } catch (err) {
      setProducts(prev => prev.map(item => item.id === productId ? { ...item, [field]: !nextValue } : item));
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingToggles(prev => ({ ...prev, [productId]: false }));
    }
  };

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
      <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <Sidebar />
        <div style={{ flex: 1, background: '#ffffff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 48 }}>
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
              Add Product
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
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Featured</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#6c757d', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ background: '#fff', borderBottom: '1px solid #f1f3f5', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.brand}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.category_name || ''}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.stock ?? 0}</td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ToggleSwitch
                          value={Boolean(p.is_active)}
                          disabled={Boolean(updatingToggles[p.id])}
                          onToggle={() => handleToggleStatus(p.id, 'is_active')}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ToggleSwitch
                          value={Boolean(p.is_featured)}
                          disabled={Boolean(updatingToggles[p.id])}
                          onToggle={() => handleToggleStatus(p.id, 'is_featured')}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#333' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          style={actionButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          onMouseEnter={() => setHoveredDeleteId(p.id)}
                          onMouseLeave={() => {
                            setHoveredDeleteId(null);
                            setActiveDeleteId(null);
                          }}
                          onMouseDown={() => setActiveDeleteId(p.id)}
                          onMouseUp={() => setActiveDeleteId(null)}
                          style={{
                            ...actionButtonStyle,
                            background: activeDeleteId === p.id ? '#b91c1c' : hoveredDeleteId === p.id ? '#dc2626' : '#000',
                            borderColor: activeDeleteId === p.id ? '#b91c1c' : hoveredDeleteId === p.id ? '#dc2626' : '#000'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;

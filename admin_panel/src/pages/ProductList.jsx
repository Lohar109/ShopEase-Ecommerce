import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import TableSkeleton from '../components/TableSkeleton';
import { deleteProduct, fetchProductById, fetchProducts, updateProductStatus } from '../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingToggles, setUpdatingToggles] = useState({});
  const [exp, setExp] = useState([]);
  const navigate = useNavigate();

  const iconButtonBase = {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid #e4e4e7',
    background: '#ffffff',
    color: '#111827',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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

  const toggleExpanded = (productId) => {
    const normalized = String(productId);
    setExp((prev) => (prev.includes(normalized) ? prev.filter((id) => id !== normalized) : [...prev, normalized]));
  };

  const isExpanded = (productId) => exp.includes(String(productId));

  const getBasePrice = (product) => {
    if (!Array.isArray(product?.variants) || product.variants.length === 0) return null;
    const prices = product.variants
      .map((variant) => Number(variant?.price))
      .filter((price) => Number.isFinite(price));
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const getPriceAdjustmentLabel = (variantPrice, basePrice) => {
    if (!Number.isFinite(variantPrice) || !Number.isFinite(basePrice)) return '-';
    const delta = variantPrice - basePrice;
    if (Math.abs(delta) < 0.0001) return '0.00';
    return `${delta > 0 ? '+' : '-'}${Math.abs(delta).toFixed(2)}`;
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setExp((prev) => prev.filter((id) => id !== String(productId)));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId, field) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const nextValue = !product[field];

    setProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, [field]: nextValue } : item)));
    setUpdatingToggles((prev) => ({ ...prev, [productId]: true }));

    try {
      await updateProductStatus(productId, { [field]: nextValue });
    } catch (err) {
      setProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, [field]: !nextValue } : item)));
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingToggles((prev) => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        const list = Array.isArray(data) ? data : [];

        const hydrated = await Promise.all(
          list.map(async (product) => {
            try {
              const detail = await fetchProductById(product.id);
              return { ...product, variants: Array.isArray(detail?.variants) ? detail.variants : [] };
            } catch {
              return { ...product, variants: [] };
            }
          })
        );

        setProducts(hydrated);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const rows = useMemo(() => products, [products]);

  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e4e4e7',
        padding: 30,
      }}
    >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, letterSpacing: '0.3px', margin: 0, color: '#111' }}>
              Product Management
            </h2>
            <button
              onClick={() => navigate('/products/new')}
              style={{
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Add Product
            </button>
          </div>

          {!loading && rows.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', fontSize: 16, fontFamily: 'Poppins, sans-serif', padding: 50 }}>
              No products found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Audience</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Base Price / Adj</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>SKU</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stock</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</th>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 600, color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actions</th>
                  </tr>
                </thead>

                {loading ? (
                  <TableSkeleton
                    rows={5}
                    cols={8}
                    productCol={0}
                    columns={['product', 'text', 'text', 'text', 'text', 'toggle', 'toggle', 'actions']}
                  />
                ) : (
                <tbody>
                  {rows.map((product) => {
                    const expanded = isExpanded(product.id);
                    const basePrice = getBasePrice(product);
                    const variants = Array.isArray(product.variants) ? product.variants : [];

                    return (
                      <React.Fragment key={product.id}>
                        <tr
                          onClick={() => toggleExpanded(product.id)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            background: expanded ? '#fafafa' : '#ffffff',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <td style={{ padding: '14px', fontSize: 14, color: '#111827' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              <img
                                src={product.main_image}
                                alt={product.name}
                                style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', background: '#f4f4f5', border: '1px solid #e4e4e7' }}
                              />
                              <div style={{ display: 'grid' }}>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{product.name}</span>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>{product.category_name || 'Uncategorized'}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px', fontSize: 14, color: '#334155', textTransform: 'capitalize' }}>{product.audience || '-'}</td>
                          <td style={{ padding: '14px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                            {Number.isFinite(basePrice) ? `₹${basePrice.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ padding: '14px', fontSize: 13, color: '#94a3b8' }}>-</td>
                          <td style={{ padding: '14px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{product.stock ?? 0}</td>
                          <td style={{ padding: '14px', verticalAlign: 'middle' }} onClick={(event) => event.stopPropagation()}>
                            <ToggleSwitch
                              value={Boolean(product.is_active)}
                              disabled={Boolean(updatingToggles[product.id])}
                              onToggle={() => handleToggleStatus(product.id, 'is_active')}
                            />
                          </td>
                          <td style={{ padding: '14px', verticalAlign: 'middle' }} onClick={(event) => event.stopPropagation()}>
                            <ToggleSwitch
                              value={Boolean(product.is_featured)}
                              disabled={Boolean(updatingToggles[product.id])}
                              onToggle={() => handleToggleStatus(product.id, 'is_featured')}
                            />
                          </td>
                          <td style={{ padding: '14px' }} onClick={(event) => event.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                                title="Edit product"
                                style={iconButtonBase}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id)}
                                title="Delete product"
                                style={{
                                  ...iconButtonBase,
                                  border: '1px solid #fecaca',
                                  background: '#fef2f2',
                                  color: '#dc2626'
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (variants.length > 0 ? variants : [{ __empty: true }]).map((variant, index) => {
                          if (variant.__empty) {
                            return (
                              <tr key={`empty-${product.id}`} style={{ background: '#ffffff' }}>
                                <td style={{ padding: '12px 14px 12px 48px', color: '#94a3b8', fontSize: 13 }} colSpan={8}>
                                  No variants found for this product.
                                </td>
                              </tr>
                            );
                          }

                          const variantPrice = Number(variant?.price);
                          const adjustment = getPriceAdjustmentLabel(variantPrice, basePrice);

                          return (
                            <tr key={`${product.id}-${variant.id || index}`} style={{ background: '#ffffff' }}>
                              <td style={{ padding: '10px 14px 10px 48px', fontSize: 13, color: '#374151', position: 'relative' }}>
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: 30,
                                    top: 0,
                                    bottom: 0,
                                    width: 1,
                                    background: '#e5e7eb'
                                  }}
                                />
                                <span style={{ fontWeight: 600 }}>Size:</span> {variant.size || '-'}
                                <span style={{ color: '#9ca3af', margin: '0 6px' }}>•</span>
                                <span style={{ fontWeight: 600 }}>Color:</span> {variant.color || '-'}
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#9ca3af' }}>-</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                                {Number.isFinite(variantPrice) ? `₹${variantPrice.toFixed(2)}` : '-'}
                                <span style={{ color: '#6b7280', marginLeft: 8 }}>
                                  ({adjustment === '-' ? '-' : `Adj ${adjustment}`})
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#334155' }}>{variant.sku || '-'}</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{variant.stock ?? 0}</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#9ca3af' }}>-</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#9ca3af' }}>-</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#9ca3af' }}>-</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                )}
              </table>
            </div>
          )}
    </div>
  );
};

export default ProductList;

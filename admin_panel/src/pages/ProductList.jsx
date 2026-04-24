import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import TableSkeleton from '../components/TableSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import { fetchCategories } from '../services/categoryService';
import { deleteProduct, fetchProductById, fetchProducts, updateProductStatus } from '../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingToggles, setUpdatingToggles] = useState({});
  const [exp, setExp] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');
  const [selectedFilterSubcategory, setSelectedFilterSubcategory] = useState('');
  const [selectedFilterSubSub, setSelectedFilterSubSub] = useState('');
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

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete);
      setProducts((prev) => prev.filter((product) => product.id !== productToDelete));
      setExp((prev) => prev.filter((id) => id !== String(productToDelete)));
      setProductToDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
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
        const [data, catsData] = await Promise.all([fetchProducts(), fetchCategories()]);
        setCategories(Array.isArray(catsData) ? catsData : []);
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

  const filterSubcategoryOptions = useMemo(
    () => categories.filter(c => String(c.parent_id) === String(selectedFilterCategory)),
    [categories, selectedFilterCategory]
  );

  const filterSubSubOptions = useMemo(
    () => (selectedFilterSubcategory ? categories.filter(c => String(c.parent_id) === String(selectedFilterSubcategory)) : []),
    [categories, selectedFilterSubcategory]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    const activeCategoryId = selectedFilterSubSub || selectedFilterSubcategory || selectedFilterCategory;
    
    if (activeCategoryId) {
      const getAllDescendantIds = (catId) => {
        if (!catId) return [];
        let descendants = [String(catId)];
        let currentChildren = categories.filter(c => String(c.parent_id) === String(catId)).map(c => String(c.id));
        
        while (currentChildren.length > 0) {
          descendants = descendants.concat(currentChildren);
          let nextChildren = [];
          currentChildren.forEach(childId => {
            nextChildren = nextChildren.concat(categories.filter(c => String(c.parent_id) === childId).map(c => String(c.id)));
          });
          currentChildren = nextChildren;
        }
        return descendants;
      };
      
      const descendantIds = getAllDescendantIds(activeCategoryId);
      result = result.filter(product => descendantIds.includes(String(product.category_id)));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((product) => {
        const matchName = product.name?.toLowerCase().includes(query);
        const matchBrand = product.brand?.toLowerCase().includes(query);
        const matchCategory = product.category_name?.toLowerCase().includes(query);
        return matchName || matchBrand || matchCategory;
      });
    }

    return result;
  }, [products, searchQuery, selectedFilterCategory, selectedFilterSubcategory, selectedFilterSubSub, categories]);

  const rows = useMemo(() => filteredProducts, [filteredProducts]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 400 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Products"
                  style={{
                    width: '100%',
                    height: '42px',
                    boxSizing: 'border-box',
                    padding: '0 16px',
                    borderRadius: 10,
                    border: '1px solid #e4e4e7',
                    background: '#fafafa',
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#18181b';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e4e4e7';
                    e.target.style.background = '#fafafa';
                  }}
                />
              </div>
              <button
                onClick={() => navigate('/products/new')}
                style={{
                  height: '42px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 18px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                Add Product
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: '#fafafa', padding: 12, borderRadius: 10, border: '1px solid #e4e4e7', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#71717a' }}>Filters:</span>
            
            <div style={{ position: 'relative' }}>
              <select
                value={selectedFilterCategory}
                onChange={(e) => {
                  setSelectedFilterCategory(e.target.value);
                  setSelectedFilterSubcategory('');
                  setSelectedFilterSubSub('');
                }}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  height: 42,
                  padding: '0 48px 0 16px',
                  lineHeight: 'normal',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  border: '1px solid #e4e4e7',
                  fontSize: 13,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  minWidth: 160,
                  background: '#ffffff'
                }}
              >
                <option value="">All Categories</option>
                {categories.filter(c => c.parent_id === null).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#71717a" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={selectedFilterSubcategory}
                onChange={(e) => {
                  setSelectedFilterSubcategory(e.target.value);
                  setSelectedFilterSubSub('');
                }}
                disabled={!selectedFilterCategory}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  height: 42,
                  padding: '0 48px 0 16px',
                  lineHeight: 'normal',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  border: '1px solid #e4e4e7',
                  fontSize: 13,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  minWidth: 160,
                  background: '#ffffff',
                  opacity: !selectedFilterCategory ? 0.6 : 1
                }}
              >
                <option value="">All Subcategories</option>
                {filterSubcategoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#71717a" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: !selectedFilterCategory ? 0.6 : 1 }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={selectedFilterSubSub}
                onChange={(e) => setSelectedFilterSubSub(e.target.value)}
                disabled={!selectedFilterSubcategory || filterSubSubOptions.length === 0}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  height: 42,
                  padding: '0 48px 0 16px',
                  lineHeight: 'normal',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  border: '1px solid #e4e4e7',
                  fontSize: 13,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  minWidth: 160,
                  background: '#ffffff',
                  opacity: (!selectedFilterSubcategory || filterSubSubOptions.length === 0) ? 0.6 : 1
                }}
              >
                <option value="">All Sub-Subcategories</option>
                {filterSubSubOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#71717a" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: (!selectedFilterSubcategory || filterSubSubOptions.length === 0) ? 0.6 : 1 }} />
            </div>

            {(selectedFilterCategory || selectedFilterSubcategory || selectedFilterSubSub || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFilterCategory('');
                  setSelectedFilterSubcategory('');
                  setSelectedFilterSubSub('');
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                Clear Filters
              </button>
            )}
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
                                onClick={() => setProductToDelete(product.id)}
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
                              <tr key={`empty-${product.id}`} style={{ background: '#f8fafc' }}>
                                <td
                                  style={{
                                    padding: '12px 14px 12px 48px',
                                    color: '#94a3b8',
                                    fontSize: 13,
                                    borderTop: '1px solid #e5e7eb'
                                  }}
                                  colSpan={8}
                                >
                                  No variants found for this product.
                                </td>
                              </tr>
                            );
                          }

                          const variantPrice = Number(variant?.price);
                          const adjustment = getPriceAdjustmentLabel(variantPrice, basePrice);

                          return (
                            <tr
                              key={`${product.id}-${variant.id || index}`}
                              style={{
                                background: '#f8fafc',
                                borderTop: index === 0 ? '1px solid #e5e7eb' : 'none'
                              }}
                            >
                              <td style={{ padding: '10px 14px 10px 48px', fontSize: 13, color: '#52525b', position: 'relative' }}>
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: 28,
                                    top: 8,
                                    bottom: 8,
                                    width: 0,
                                    borderLeft: '2px solid #d4d4d8'
                                  }}
                                />
                                <span style={{ fontWeight: 600 }}>Size:</span> {variant.size || '-'}
                                <span style={{ color: '#9ca3af', margin: '0 6px' }}>•</span>
                                <span style={{ fontWeight: 600 }}>Color:</span> {variant.color || '-'}
                              </td>
                              <td style={{ padding: '10px 14px' }} />
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#52525b', fontWeight: 600 }}>
                                {Number.isFinite(variantPrice) ? `₹${variantPrice.toFixed(2)}` : '-'}
                                <span style={{ color: '#6b7280', marginLeft: 8 }}>
                                  ({adjustment === '-' ? '-' : `Adj ${adjustment}`})
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 12, color: '#52525b', whiteSpace: 'nowrap' }}>{variant.sku || '-'}</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: '#52525b', fontWeight: 600 }}>{variant.stock ?? 0}</td>
                              <td style={{ padding: '10px 14px' }} />
                              <td style={{ padding: '10px 14px' }} />
                              <td style={{ padding: '10px 14px' }} />
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
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Are you sure?"
        message="This action cannot be undone. This product will be permanently deleted."
        cancelLabel="Cancel"
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default ProductList;

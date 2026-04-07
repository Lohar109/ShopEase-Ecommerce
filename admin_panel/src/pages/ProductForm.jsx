import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCategory } from '../services/categoryService';
import { fetchCategories } from '../services/categoryService';
import { saveProduct } from '../services/productService';

const TABS = [
  { label: 'General Details', key: 'general' },
  { label: 'Media', key: 'media' },
  { label: 'Inventory', key: 'inventory' },
];

const ProductForm = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  // General Details state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  // Dynamic specifications
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  // Add Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Media state (Cloudinary URLs only)
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState(['']);

  // Gallery handlers
  const handleGalleryImageChange = (idx, value) => {
    setGalleryImages(imgs => imgs.map((img, i) => (i === idx ? value : img)));
  };
  const addGalleryImage = () => setGalleryImages(imgs => [...imgs, '']);
  const removeGalleryImage = idx => setGalleryImages(imgs => imgs.filter((_, i) => i !== idx));
  useEffect(() => {
    setSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  }, [name]);

  // Fetch categories
  const loadCategories = () => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  };
  useEffect(() => {
    loadCategories();
  }, []);

  // Set default category if available
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  // Add Category handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryImage.trim()) return;
    setAddingCategory(true);
    try {
      await addCategory({ name: newCategoryName, image: newCategoryImage });
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryImage('');
      loadCategories();
    } catch (err) {
      alert('Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  // Dynamic specifications handlers
  const handleSpecChange = (idx, field, value) => {
    setSpecs(specs => specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = idx => setSpecs(specs => specs.filter((_, i) => i !== idx));

  // --- Variant state and handlers ---
  const [variantRows, setVariantRows] = useState([
    { size: '', color: '', price: '', stock: '', sku: '', image: '' }
  ]);

  // Helper to get product initials
  const getProductInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .join('');
  };

  // SKU generation logic
  const generateSKU = (brand, name, color, size) => {
    const brandCode = brand?.slice(0, 2).toUpperCase() || '';
    const initials = getProductInitials(name);
    const colorCode = color?.slice(0, 3).toUpperCase() || '';
    const sizeCode = size?.toString().toUpperCase() || '';
    return [brandCode, initials, colorCode, sizeCode].filter(Boolean).join('-');
  };

  // Update variant row and always auto-generate SKU
  const handleVariantChange = (idx, field, value) => {
    setVariantRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      let updated = { ...row, [field]: value };
      updated.sku = generateSKU(brand, name, updated.color, updated.size);
      return updated;
    }));
  };

  // When brand or name changes, update all SKUs
  useEffect(() => {
    setVariantRows(rows => rows.map(row => ({
      ...row,
      sku: generateSKU(brand, name, row.color, row.size)
    })));
    // eslint-disable-next-line
  }, [brand, name]);

  const addVariant = () => setVariantRows([...variantRows, { size: '', color: '', price: '', stock: '', sku: '', image: '' }]);
  const removeVariant = idx => setVariantRows(rows => rows.filter((_, i) => i !== idx));

  // Toggle SKU edit mode
  const toggleSkuEditable = (idx) => {
    setVariantRows(rows => rows.map((row, i) => i === idx ? { ...row, skuEditable: !row.skuEditable } : row));
  };
  // Mark SKU as manually edited
  const handleSkuManualEdit = (idx, value) => {
    setVariantRows(rows => rows.map((row, i) => i === idx ? { ...row, sku: value, skuManuallyEdited: true } : row));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Sticky Header & Breadcrumbs */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ color: '#888', fontSize: 15, fontWeight: 500 }}>
          Products / <span style={{ color: '#111', fontWeight: 600 }}>Add New Product</span>
        </div>
        <button
          type="button"
          style={{ 
            background: saving ? '#888' : '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '8px 20px', 
            fontSize: 15, 
            fontWeight: 500, 
            cursor: saving ? 'not-allowed' : 'pointer', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Poppins, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          disabled={saving}
          onClick={async () => {
            if (!categoryId) {
              alert('Please select a category.');
              return;
            }
            setSaving(true);
            try {
              const productData = {
                name, slug, brand, description, category_id: categoryId,
                main_image: mainImage, images: galleryImages.filter(Boolean),
                specifications: Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value])),
                variants: variantRows.map(v => ({
                  size: v.size, color: v.color, price: v.price, stock: v.stock, sku: v.sku, image: v.image
                }))
              };
              await saveProduct(productData);
              setSaving(false);
              navigate('/products');
            } catch (err) {
              setSaving(false);
              alert(err.message || 'Failed to save product');
            }
          }}
        >
          {saving && (
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </svg>
          )}
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div style={{
        maxWidth: 800,
        margin: '40px auto 0',
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        padding: '48px',
      }}>
          <div style={{ maxWidth: '100%', margin: '0 auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>General Details</h3>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Product Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
                placeholder="Enter product name"
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Slug (auto-generated)</label>
              <input
                type="text"
                value={slug}
                readOnly
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #eee', background: '#f5f6fa', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
                placeholder="Enter brand name"
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', minHeight: 80, marginTop: 4 }}
                placeholder="Enter product description"
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Category</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  style={{ background: '#fff', border: '1px solid #000', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', color: '#000', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>+</span> Add Category
                </button>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '24px 0' }} />

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Specifications</label>
              {specs.map((spec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={spec.key}
                    onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                    placeholder="Key (e.g. Material)"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. Cotton)"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                  />
                  <button type="button" onClick={() => removeSpec(idx)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#d32f2f' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addSpec} style={{ marginTop: 4, background: '#fff', border: '1px solid #000', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}><span>+</span> Add Specification</button>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' }} />
            
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Media</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Main Image URL</label>
              <input
                type="text"
                value={mainImage}
                onChange={e => setMainImage(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
                placeholder="Paste Cloudinary main image URL"
                required
              />
              {mainImage && (
                <img src={mainImage} alt="Main" style={{ marginTop: 10, maxWidth: 180, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Gallery Image URLs</label>
              {galleryImages.map((img, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={img}
                    onChange={e => handleGalleryImageChange(idx, e.target.value)}
                    placeholder="Paste Cloudinary image URL"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                  />
                  <button type="button" onClick={() => removeGalleryImage(idx)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#d32f2f' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addGalleryImage} style={{ marginTop: 4, background: '#f5f6fa', border: '1px solid #ccc', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#111' }}>+ Add Image Link</button>
              {galleryImages.filter(Boolean).length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  {galleryImages.filter(Boolean).map((img, i) => (
                    <img key={i} src={img} alt="Gallery" style={{ maxWidth: 90, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ color: '#888', fontSize: 14, marginTop: 16 }}>
              (Paste Cloudinary image links. You can add as many as you want.)
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' }} />
            
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Inventory</h3>
            <label style={{ fontWeight: 600, marginBottom: 16, display: 'block', fontSize: 13, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>Product Variants</label>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Color</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Price</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Stock</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Image</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic variant rows */}
                {variantRows.map((variant, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td><input type="text" value={variant.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} /></td>
                    <td><input type="text" value={variant.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} style={{ width: 90, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} /></td>
                    <td><input type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} /></td>
                    <td><input type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(idx, 'stock', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} /></td>
                    <td>
                      <input
                        type="text"
                        value={variant.sku}
                        readOnly
                        style={{ width: 100, padding: 4, borderRadius: 4, border: '1px solid #ccc', background: '#f5f6fa', color: '#888' }}
                      />
                    </td>
                    <td><input type="text" value={variant.image} onChange={e => handleVariantChange(idx, 'image', e.target.value)} style={{ width: 100, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} placeholder="Image URL" /></td>
                    <td><button type="button" onClick={() => removeVariant(idx)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#d32f2f' }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addVariant} style={{ background: '#fff', border: '1px solid #000', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}><span>+</span> Add Variant</button>
          </div>
        </div>
        {/* Add Category Modal */}
        {showCategoryModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <form onSubmit={handleAddCategory} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32, minWidth: 340 }}>
              <h3 style={{ marginBottom: 18, fontWeight: 700 }}>Add New Category</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 500 }}>Name</label>
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Image URL</label>
                <input type="text" value={newCategoryImage} onChange={e => setNewCategoryImage(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', color: '#333' }}>Cancel</button>
                <button type="submit" disabled={addingCategory} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>{addingCategory ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        )}
    </div>
  );
}

export default ProductForm;

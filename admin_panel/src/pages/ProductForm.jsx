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
      background: 'linear-gradient(120deg, #f5f6fa 0%, #e9ecef 100%)',
      padding: '60px 0',
    }}>
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: 40,
        position: 'relative',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 36,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 1,
          color: '#222',
        }}>Add New Product</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 36,
          gap: 18,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 32px',
                border: 'none',
                borderBottom: activeTab === tab.key ? '4px solid #111' : '4px solid transparent',
                background: 'none',
                fontWeight: 700,
                fontSize: 18,
                color: activeTab === tab.key ? '#111' : '#aaa',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border 0.2s, color 0.2s',
                letterSpacing: 0.5,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          {activeTab === 'general' && (
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
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
                  style={{ background: '#f5f6fa', border: '1px solid #ccc', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', color: '#111', marginTop: 4, fontWeight: 600 }}
                >
                  + Add Category
                </button>
              </div>
            </div>
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
              <button type="button" onClick={addSpec} style={{ marginTop: 4, background: '#f5f6fa', border: '1px solid #ccc', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#111' }}>+ Add Specification</button>
            </div>
          </div>
        )}
        {activeTab === 'media' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
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
          </div>
        )}
        {activeTab === 'inventory' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <label style={{ fontWeight: 500, marginBottom: 12, display: 'block' }}>Product Variants</label>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f5f6fa' }}>
                  <th style={{ padding: 8, fontSize: 15 }}>Size</th>
                  <th style={{ padding: 8, fontSize: 15 }}>Color</th>
                  <th style={{ padding: 8, fontSize: 15 }}>Price</th>
                  <th style={{ padding: 8, fontSize: 15 }}>Stock</th>
                  <th style={{ padding: 8, fontSize: 15 }}>SKU</th>
                  <th style={{ padding: 8, fontSize: 15 }}>Image</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic variant rows */}
                {variantRows.map((variant, idx) => (
                  <tr key={idx}>
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
            <button type="button" onClick={addVariant} style={{ background: '#f5f6fa', border: '1px solid #ccc', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#111' }}>+ Add Variant</button>
          </div>
        )}
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

        {/* Save Product Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
          <button
            type="button"
            style={{ background: saving ? '#888' : '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 38px', fontSize: 18, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            disabled={saving}
            onClick={async () => {
              if (!categoryId) {
                alert('Please select a category.');
                return;
              }
              setSaving(true);
              try {
                // Prepare product data
                const productData = {
                  name,
                  slug,
                  brand,
                  description,
                  category_id: categoryId,
                  main_image: mainImage,
                  images: galleryImages.filter(Boolean),
                  specifications: Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value])),
                  variants: variantRows.map(v => ({
                    size: v.size,
                    color: v.color,
                    price: v.price,
                    stock: v.stock,
                    sku: v.sku,
                    image: v.image
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
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;

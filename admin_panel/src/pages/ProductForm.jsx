import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addCategory } from '../services/categoryService';
import { fetchCategories } from '../services/categoryService';
import {
  deleteDesignGallery,
  fetchDesignGalleries,
  fetchProductById,
  saveDesignGallery,
  saveProduct,
  updateProduct
} from '../services/productService';

const TABS = [
  { label: 'General Details', key: 'general' },
  { label: 'Media', key: 'media' },
  { label: 'Inventory', key: 'inventory' },
];

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
  const [pendingSubcategoryId, setPendingSubcategoryId] = useState('');
  const [prefillApplied, setPrefillApplied] = useState(false);
  const navigate = useNavigate();
  // General Details state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [audience, setAudience] = useState('unisex');
  const [categories, setCategories] = useState([]);
  // Dynamic specifications
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  // Add Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState('');

  // Media state (Cloudinary URLs only)
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState(['']);

  // Design specific gallery state
  const [designColorName, setDesignColorName] = useState('');
  const [designImagesInput, setDesignImagesInput] = useState('');
  const [designGalleries, setDesignGalleries] = useState([]);
  const [loadingDesignGalleries, setLoadingDesignGalleries] = useState(false);
  const [savingDesignGallery, setSavingDesignGallery] = useState(false);
  const [deletingDesignGalleryId, setDeletingDesignGalleryId] = useState('');

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

  useEffect(() => {
    if (!isEditMode) return;

    const loadProduct = async () => {
      setLoadingProduct(true);
      try {
        const data = await fetchProductById(id);
        const product = data?.product;
        const variants = data?.variants || [];

        if (!product) {
          alert('Product not found');
          navigate('/products');
          return;
        }

        setName(product.name || '');
        setSlug(product.slug || '');
        setBrand(product.brand || '');
        setDescription(product.description || '');
        setAudience(product.audience || 'unisex');
        setMainImage(product.main_image || '');
        setGalleryImages(Array.isArray(product.images) && product.images.length > 0 ? product.images : ['']);

        const specEntries = product.specifications && typeof product.specifications === 'object'
          ? Object.entries(product.specifications)
          : [];
        setSpecs(specEntries.length > 0 ? specEntries.map(([key, value]) => ({ key, value: String(value) })) : [{ key: '', value: '' }]);

        setVariantRows(
          variants.length > 0
            ? variants.map(v => ({
                size: v.size || '',
                color: v.color || '',
                price: v.price ?? '',
                stock: v.stock ?? '',
                sku: v.sku || '',
                image: v.image || ''
              }))
            : [{ size: '', color: '', price: '', stock: '', sku: '', image: '' }]
        );

        setEditProductData(product || null);
        setPrefillApplied(false);
        setPendingSubcategoryId('');
      } catch (err) {
        alert(err.message || 'Failed to load product details');
        navigate('/products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, isEditMode, navigate]);

  const loadDesignGalleries = async (productId) => {
    if (!productId) return;

    setLoadingDesignGalleries(true);
    try {
      const galleries = await fetchDesignGalleries(productId);
      setDesignGalleries(Array.isArray(galleries) ? galleries : []);
    } catch (err) {
      setDesignGalleries([]);
      alert(err.message || 'Failed to load design galleries');
    } finally {
      setLoadingDesignGalleries(false);
    }
  };

  useEffect(() => {
    if (!isEditMode || !id) return;
    loadDesignGalleries(id);
  }, [id, isEditMode]);

  // Set default category if available
  useEffect(() => {
    if (isEditMode) return;
    if (!categoryId && categories.length > 0) {
      const mainCategories = categories.filter(c => c.parent_id === null);
      if (mainCategories.length > 0) setCategoryId(mainCategories[0].id);
    }
  }, [categories, categoryId, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !editProductData || prefillApplied || categories.length === 0) return;

    const selectedCategory = categories.find(c => String(c.id) === String(editProductData.category_id));
    if (!selectedCategory) {
      setPrefillApplied(true);
      return;
    }

    if (selectedCategory.parent_id) {
      // Phase 2: set parent first so child options are derived for this parent.
      setCategoryId(selectedCategory.parent_id);
      setSubcategoryId('');
      setPendingSubcategoryId(selectedCategory.id);
      return;
    }

    setCategoryId(selectedCategory.id);
    setSubcategoryId('');
    setPendingSubcategoryId('');
    setPrefillApplied(true);
  }, [categories, editProductData, isEditMode, prefillApplied]);

  const filteredSubcategories = useMemo(
    () => categories.filter(c => c.parent_id === categoryId),
    [categories, categoryId]
  );

  useEffect(() => {
    // Phase 3: wait until subcategory options exist before selecting child.
    if (!pendingSubcategoryId || filteredSubcategories.length === 0 || !editProductData) return;

    const hasPendingOption = filteredSubcategories.some(
      (subcategory) => String(subcategory.id) === String(pendingSubcategoryId)
    );

    if (!hasPendingOption) return;

    setSubcategoryId(editProductData.category_id || '');
    setPendingSubcategoryId('');
    setPrefillApplied(true);
  }, [filteredSubcategories, pendingSubcategoryId, editProductData]);

  const isSubcategoriesLoading =
    isEditMode && !!pendingSubcategoryId && filteredSubcategories.length === 0;

  // Add Category handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryImage.trim()) return;
    const normalizedParentCategoryId = String(parentCategoryId || '').trim();
    if (isSubcategory && !normalizedParentCategoryId) {
      alert('Please select a parent category.');
      return;
    }
    setAddingCategory(true);
    try {
      const payload = { name: newCategoryName, image: newCategoryImage };
      if (isSubcategory) {
        payload.parent_id = normalizedParentCategoryId;
      } else {
        payload.parent_id = null;
      }
      await addCategory(payload);
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryImage('');
      setIsSubcategory(false);
      setParentCategoryId('');
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

  // Keep the primary variant image synced with main image to avoid duplicate entry.
  useEffect(() => {
    setVariantRows((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) {
        return [{ size: '', color: '', price: '', stock: '', sku: '', image: mainImage || '' }];
      }

      if ((rows[0]?.image || '') === (mainImage || '')) {
        return rows;
      }

      return rows.map((row, idx) => (idx === 0 ? { ...row, image: mainImage || '' } : row));
    });
  }, [mainImage]);

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

  const handleSubmitProduct = async () => {
    if (!categoryId) {
      alert('Please select a category.');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name,
        slug,
        brand,
        description,
        category_id: subcategoryId || categoryId,
        audience,
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

      if (isEditMode) {
        await updateProduct(id, productData);
      } else {
        await saveProduct(productData);
      }

      setSaving(false);
      navigate('/products');
    } catch (err) {
      setSaving(false);
      alert(err.message || 'Failed to save product');
    }
  };

  const handleSaveDesignGallery = async () => {
    if (!isEditMode || !id) {
      alert('Please save the product first, then add design galleries.');
      return;
    }

    const normalizedColor = designColorName.trim();
    const parsedImages = designImagesInput
      .split(/\r?\n|,/) 
      .map((value) => value.trim())
      .filter(Boolean);

    if (!normalizedColor || parsedImages.length === 0) {
      alert('Please provide color name and at least one image URL.');
      return;
    }

    setSavingDesignGallery(true);
    try {
      await saveDesignGallery({
        product_id: id,
        color_name: normalizedColor,
        images: parsedImages,
      });
      setDesignColorName('');
      setDesignImagesInput('');
      await loadDesignGalleries(id);
    } catch (err) {
      alert(err.message || 'Failed to save design gallery');
    } finally {
      setSavingDesignGallery(false);
    }
  };

  const handleDeleteDesignGallery = async (galleryId) => {
    const confirmed = window.confirm('Delete this design gallery?');
    if (!confirmed) return;

    setDeletingDesignGalleryId(galleryId);
    try {
      await deleteDesignGallery(galleryId);
      setDesignGalleries((prev) => prev.filter((gallery) => gallery.id !== galleryId));
    } catch (err) {
      alert(err.message || 'Failed to delete design gallery');
    } finally {
      setDeletingDesignGalleryId('');
    }
  };

  if (loadingProduct) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif' }}>
        Loading product...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: '80px'
    }}>
      <style>{`
        .custom-input { transition: border-color 0.2s ease; font-family: 'Poppins', sans-serif; }
        .custom-input:focus { border-color: #000 !important; outline: none; box-shadow: 0 0 0 1px #000; }
        .outline-btn { transition: all 0.2s ease; background: #000 !important; color: #fff !important; border: 1px solid #000 !important; border-radius: 12px !important; padding: 8px 16px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Poppins', sans-serif; white-space: nowrap; }
        .outline-btn:hover { background: #333 !important; border-color: #333 !important; }
        .remove-tag-btn { transition: all 0.2s ease; background: #eee; border: none; border-radius: 50%; width: 28px; height: 28px; padding: 0; cursor: pointer; color: #555; display: inline-flex; align-items: center; justify-content: center; }
        .remove-tag-btn:hover { background: #e53935; color: #fff; }
        .remove-tag-btn svg { width: 14px; height: 14px; stroke-width: 2; flex-shrink: 0; }
        .auto-sync-tooltip-wrap { position: relative; display: inline-block; }
        .auto-sync-tooltip-bubble {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%) scale(0.96);
          transform-origin: bottom center;
          background: #111827;
          color: #fff;
          font-size: 12px;
          line-height: 1.2;
          text-align: center;
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: 6px;
          opacity: 0;
          pointer-events: none;
          transition: all 200ms ease;
          z-index: 5;
        }
        .auto-sync-tooltip-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 100%;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #111827;
        }
        .auto-sync-tooltip-wrap:hover .auto-sync-tooltip-bubble,
        .auto-sync-tooltip-wrap:focus-within .auto-sync-tooltip-bubble {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
      `}</style>
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
          Products / <span style={{ color: '#111', fontWeight: 600 }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</span>
        </div>
        <button
          type="button"
          style={{ 
            background: saving ? '#888' : '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 12, 
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
          onClick={handleSubmitProduct}
        >
          {saving && (
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </svg>
          )}
          {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      <div style={{
        maxWidth: 800,
        margin: '40px auto 0',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/products'); }} style={{ color: '#666', textDecoration: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
            &lt; Back to Products
          </a>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111', margin: '8px 0 0 0', fontFamily: 'Poppins, sans-serif' }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <div style={{
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
                className="custom-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                placeholder="Enter product name"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Target Audience</label>
                <select
                  className="custom-input"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                  required
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Slug (auto-generated)</label>
                <input
                  className="custom-input"
                  type="text"
                  value={slug}
                  readOnly
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', background: '#f5f6fa', marginTop: 4 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Brand</label>
              <input
                className="custom-input"
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                placeholder="Enter brand name"
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Description</label>
              <textarea
                className="custom-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', minHeight: 80, marginTop: 4 }}
                placeholder="Enter product description"
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Category</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <select
                    className="custom-input"
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                      setPendingSubcategoryId('');
                    }}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c.parent_id === null).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                      setParentCategoryId('');
                      setIsSubcategory(false);
                      setShowCategoryModal(true);
                    }}
                  >
                    Add Category
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, color: !categoryId ? '#aaa' : '#000', display: 'block', marginBottom: 4 }}>Subcategory</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <select
                    className="custom-input"
                    value={subcategoryId}
                    onChange={e => setSubcategoryId(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', opacity: (!categoryId || isSubcategoriesLoading) ? 0.6 : 1, background: (!categoryId || isSubcategoriesLoading) ? '#f5f6fa' : '#fff' }}
                    disabled={!categoryId || isSubcategoriesLoading}
                  >
                    <option value="">{isSubcategoriesLoading ? 'Loading subcategories...' : 'Select subcategory'}</option>
                    {filteredSubcategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                      if (categoryId) setParentCategoryId(categoryId);
                      setIsSubcategory(true);
                      setShowCategoryModal(true);
                    }}
                  >
                    Add Subcategory
                  </button>
                </div>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #a0a0a0', margin: '24px 0' }} />

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Specifications</label>
              {specs.map((spec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="custom-input"
                    type="text"
                    value={spec.key}
                    onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                    placeholder="Key (e.g. Material)"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                  />
                  <input
                    className="custom-input"
                    type="text"
                    value={spec.value}
                    onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. Cotton)"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                  />
                  <button type="button" className="remove-tag-btn" onClick={() => removeSpec(idx)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" className="outline-btn" onClick={addSpec} style={{ marginTop: 4 }}>Add Specification</button>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' }} />
            
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Media</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Main Image URL</label>
              <input
                className="custom-input"
                type="text"
                value={mainImage}
                onChange={e => setMainImage(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                placeholder="Paste Cloudinary main image URL"
                required
              />
              {mainImage && (
                <img src={mainImage} alt="Main" style={{ marginTop: 10, maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Gallery Image URLs</label>
              {galleryImages.map((img, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="custom-input"
                    type="text"
                    value={img}
                    onChange={e => handleGalleryImageChange(idx, e.target.value)}
                    placeholder="Paste Cloudinary image URL"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                  />
                  <button type="button" className="remove-tag-btn" onClick={() => removeGalleryImage(idx)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" className="outline-btn" onClick={addGalleryImage} style={{ marginTop: 4 }}>Add Image Link</button>
              {galleryImages.filter(Boolean).length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  {galleryImages.filter(Boolean).map((img, i) => (
                    <img key={i} src={img} alt="Gallery" style={{ maxWidth: 90, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ color: '#888', fontSize: 14, marginTop: 16 }}>
              (Paste Cloudinary image links. You can add as many as you want.)
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' }} />

            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Design Specific Galleries</h3>
            {!isEditMode ? (
              <div style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                Save the product first, then you can add color-specific galleries.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Color Name</label>
                  <input
                    className="custom-input"
                    type="text"
                    value={designColorName}
                    onChange={(e) => setDesignColorName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                    placeholder="e.g. Red, Floral, Midnight Blue"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Image URLs (comma or new line separated)</label>
                  <textarea
                    className="custom-input"
                    value={designImagesInput}
                    onChange={(e) => setDesignImagesInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', minHeight: 100, marginTop: 4 }}
                    placeholder={'https://res.cloudinary.com/.../image1.jpg\nhttps://res.cloudinary.com/.../image2.jpg'}
                  />
                </div>
                <button
                  type="button"
                  className="outline-btn"
                  onClick={handleSaveDesignGallery}
                  disabled={savingDesignGallery}
                  style={{ opacity: savingDesignGallery ? 0.7 : 1 }}
                >
                  {savingDesignGallery ? 'Saving Gallery...' : 'Save Gallery'}
                </button>

                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>Added Galleries</h4>
                  {loadingDesignGalleries ? (
                    <div style={{ color: '#666', fontSize: 14 }}>Loading galleries...</div>
                  ) : designGalleries.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 14 }}>No design specific galleries added yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {designGalleries.map((gallery) => (
                        <div key={gallery.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, color: '#111' }}>{gallery.color_name}</div>
                            <button
                              type="button"
                              className="remove-tag-btn"
                              onClick={() => handleDeleteDesignGallery(gallery.id)}
                              disabled={deletingDesignGalleryId === gallery.id}
                              title="Delete gallery"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {(gallery.images || []).map((imgUrl, imgIdx) => (
                              <img
                                key={`${gallery.id}-${imgIdx}`}
                                src={imgUrl}
                                alt={`${gallery.color_name} ${imgIdx + 1}`}
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #f0f0f0' }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
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
                    <td><input className="custom-input" type="text" value={variant.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                    <td><input className="custom-input" type="text" value={variant.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} style={{ width: 90, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                    <td><input className="custom-input" type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} style={{ width: 70, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                    <td><input className="custom-input" type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(idx, 'stock', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                    <td>
                      <input
                        className="custom-input"
                        type="text"
                        value={variant.sku}
                        readOnly
                        style={{ width: 100, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0', background: '#f5f6fa', color: '#888' }}
                      />
                    </td>
                    <td>
                      {idx === 0 ? (
                        <span className="auto-sync-tooltip-wrap">
                          <input
                            className="custom-input"
                            type="text"
                            value={variant.image}
                            readOnly
                            style={{
                              width: 120,
                              padding: 4,
                              borderRadius: 12,
                              border: '1px solid #d1d5db',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              cursor: 'text'
                            }}
                            placeholder="Auto-synced"
                          />
                          <span className="auto-sync-tooltip-bubble" role="tooltip">
                            Auto-synced from Main Image
                            <span className="auto-sync-tooltip-arrow" />
                          </span>
                        </span>
                      ) : (
                        <input
                          className="custom-input"
                          type="text"
                          value={variant.image}
                          onChange={e => handleVariantChange(idx, 'image', e.target.value)}
                          style={{
                            width: 120,
                            padding: 4,
                            borderRadius: 12,
                            border: '1px solid #a0a0a0',
                            background: '#fff',
                            color: '#111',
                            cursor: 'text'
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <button type="button" className="remove-tag-btn" onClick={() => removeVariant(idx)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="outline-btn" onClick={addVariant}>Add Variant</button>
          </div>
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
            <form onSubmit={handleAddCategory} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32, minWidth: 340 }}>
              <h3 style={{ marginBottom: 18, fontWeight: 700 }}>{isSubcategory ? 'Add New Subcategory' : 'Add New Category'}</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 500 }}>Name</label>
                <input className="custom-input" type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }} required />
              </div>
              {isSubcategory && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 500 }}>Parent Category</label>
                  <select
                    className="custom-input"
                    value={parentCategoryId}
                    onChange={e => setParentCategoryId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                    required={isSubcategory}
                  >
                    <option value="">Select Parent Category</option>
                    {categories.filter(c => c.parent_id === null).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Image URL</label>
                <input className="custom-input" type="text" value={newCategoryImage} onChange={e => setNewCategoryImage(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }} required />
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

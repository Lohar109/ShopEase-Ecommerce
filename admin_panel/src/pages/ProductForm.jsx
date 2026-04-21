import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Box, Check, ChevronDown, Image, Info, Layers, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import QuickAddModal from '../components/QuickAddModal';
import { addCategory, fetchCategories } from '../services/categoryService';
import {
  deleteDesignGallery,
  fetchDesignGalleries,
  fetchProductById,
  saveDesignGallery,
  saveProduct,
  updateProduct
} from '../services/productService';

const STEPS = [
  { key: 'general', label: 'General' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'media', label: 'Media' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'galleries', label: 'Galleries' },
];

const normalizeId = (value) => String(value ?? '').trim();

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
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
  const [m, setM] = useState(false);
  const [val, setVal] = useState('');
  const [t, setT] = useState('category');
  const [pId, setPId] = useState('');
  const [addingQuickCat, setAddingQuickCat] = useState(false);
  // Dynamic specifications
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

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
  const fetchCats = () => {
    return fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    const refreshCategories = () => fetchCats();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshCategories();
    };

    window.addEventListener('focus', refreshCategories);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshCategories);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
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

  const resolvedProductSubcategoryId = useMemo(() => {
    if (!editProductData || categories.length === 0) return '';

    const explicitSubcategoryId =
      normalizeId(editProductData.subcategory_id) ||
      normalizeId(editProductData.sub_category_id) ||
      normalizeId(editProductData.subcategoryId);

    if (explicitSubcategoryId) return explicitSubcategoryId;

    const productCategoryId = normalizeId(editProductData.category_id);
    const matchedCategory = categories.find(
      (category) => normalizeId(category?.id) === productCategoryId
    );

    if (!matchedCategory) return '';

    const matchedParentId = normalizeId(matchedCategory.parent_id);
    if (matchedParentId) {
      return productCategoryId;
    }

    const directChildren = categories.filter(
      (category) => normalizeId(category?.parent_id) === productCategoryId
    );

    return directChildren.length === 1 ? normalizeId(directChildren[0].id) : '';
  }, [categories, editProductData]);

  useEffect(() => {
    if (!isEditMode || !editProductData?.category_id || categories.length === 0) return;

    // Step A: Trace product.category_id in all categories and inspect parent_id.
    const matchedCategory = categories.find(
      (category) => normalizeId(category?.id) === normalizeId(editProductData.category_id)
    );

    if (!matchedCategory) {
      setCategoryId(normalizeId(editProductData.category_id));
      setSubcategoryId('');
      return;
    }

    // Step B: Set parent first when product.category_id points to a subcategory.
    if (matchedCategory.parent_id) {
      setCategoryId(normalizeId(matchedCategory.parent_id));
      setSubcategoryId('');
      return;
    }

    setCategoryId(normalizeId(matchedCategory.id));
    setSubcategoryId('');
  }, [categories, editProductData, isEditMode]);

  const subcategoriesOptions = useMemo(
    () => categories.filter(c => normalizeId(c.parent_id) === normalizeId(categoryId)),
    [categories, categoryId]
  );

  useEffect(() => {
    // Step C: Watchdog - only set subcategory after its option list is populated.
    if (!isEditMode || !resolvedProductSubcategoryId || subcategoriesOptions.length === 0) return;

    const hasOptionForProductCategory = subcategoriesOptions.some(
      (subcategory) => normalizeId(subcategory?.id) === normalizeId(resolvedProductSubcategoryId)
    );

    if (!hasOptionForProductCategory) return;
    if (normalizeId(subcategoryId) === normalizeId(resolvedProductSubcategoryId)) return;

    const timer = setTimeout(() => {
      setSubcategoryId(normalizeId(resolvedProductSubcategoryId));
    }, 0);

    return () => clearTimeout(timer);
  }, [subcategoriesOptions, isEditMode, subcategoryId, resolvedProductSubcategoryId]);

  const isSubcategoriesLoading =
    isEditMode &&
    !!resolvedProductSubcategoryId &&
    normalizeId(categoryId).length > 0 &&
    normalizeId(subcategoryId) === '' &&
    subcategoriesOptions.length === 0;

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

  const openQuickAdd = (type) => {
    setT(type);
    setVal('');
    setPId(type === 'subcategory' ? categoryId : '');
    setM(true);
  };

  const closeQuickAdd = () => {
    if (addingQuickCat) return;
    setM(false);
    setVal('');
    setPId('');
  };

  const handleQuickAdd = async () => {
    const nameValue = val.trim();
    if (!nameValue || (t === 'subcategory' && !pId)) return;

    setAddingQuickCat(true);
    try {
      const created = await addCategory({
        name: nameValue,
        parent_id: t === 'subcategory' ? pId : null,
      });

      await fetchCats();

      if (t === 'subcategory') {
        setCategoryId(String(pId));
        setSubcategoryId(String(created?.id || ''));
      } else {
        setCategoryId(String(created?.id || ''));
        setSubcategoryId('');
      }

      setPId('');
      setM(false);
      setVal('');
    } catch (err) {
      alert(err.message || 'Failed to add category');
    } finally {
      setAddingQuickCat(false);
    }
  };

  if (loadingProduct) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif' }}>
        Loading product...
      </div>
    );
  }

  const activeIdx = Math.max(0, STEPS.findIndex((s) => s.key === activeTab));
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < STEPS.length - 1;

  const stepDone = useMemo(() => {
    const general = Boolean(name.trim() && brand.trim() && description.trim() && categoryId);

    const usedSpecs = specs.filter((s) => String(s?.key || '').trim() || String(s?.value || '').trim());
    const specifications = usedSpecs.length > 0 && usedSpecs.every((s) => String(s?.key || '').trim() && String(s?.value || '').trim());

    const media = Boolean(String(mainImage || '').trim() && galleryImages.some((img) => String(img || '').trim()));

    const inventory =
      Array.isArray(variantRows) &&
      variantRows.length > 0 &&
      variantRows.every((v) => {
        const size = String(v?.size || '').trim();
        const color = String(v?.color || '').trim();
        const price = Number(v?.price);
        const stock = Number(v?.stock);
        return size && color && Number.isFinite(price) && price >= 0 && Number.isFinite(stock) && stock >= 0;
      });

    const galleries = isEditMode ? Array.isArray(designGalleries) && designGalleries.length > 0 : false;

    return {
      general,
      specifications,
      media,
      inventory,
      galleries,
    };
  }, [name, brand, description, categoryId, specs, mainImage, galleryImages, variantRows, isEditMode, designGalleries]);

  const goNext = () => {
    if (!canNext) return;
    setActiveTab(STEPS[activeIdx + 1].key);
  };

  const goBack = () => {
    if (!canPrev) return;
    setActiveTab(STEPS[activeIdx - 1].key);
  };

  const parentOptions = useMemo(() => categories.filter((c) => c.parent_id === null), [categories]);
  const canQuickAdd = t === 'subcategory' ? Boolean(pId && val.trim()) : Boolean(val.trim());

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: '80px'
    }}>
      <QuickAddModal
        m={m}
        title={t === 'subcategory' ? 'Add Subcategory' : 'Add Category'}
        val={val}
        setVal={setVal}
        isSubcategory={t === 'subcategory'}
        pId={pId}
        setPId={setPId}
        parentOptions={parentOptions}
        canAdd={canQuickAdd}
        onClose={closeQuickAdd}
        onAdd={handleQuickAdd}
        loading={addingQuickCat}
      />
      <style>{`
        .custom-input { transition: border-color 0.2s ease; font-family: 'Poppins', sans-serif; }
        .custom-input:focus { border-color: #000 !important; outline: none; box-shadow: 0 0 0 1px #000; }
        input.custom-input[type='text'],
        input.custom-input[type='url'],
        input.custom-input[type='number'] {
          height: 40px !important;
          box-sizing: border-box;
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        select.custom-input {
          height: 44px !important;
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        textarea.custom-input {
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        .pf-step-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .pf-step-layout {
            grid-template-columns: 1fr;
          }
        }
        .pf-select-wrap { position: relative; }
        .pf-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 48px !important;
        }
        .pf-select-icon {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717a;
          pointer-events: none;
        }
        .pf-step-pane {
          animation: pf-fade-slide-up 220ms ease;
        }
        .pf-check-anim {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: pf-check-pop 220ms ease-out;
          transform-origin: center;
        }
        @keyframes pf-fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pf-check-pop {
          from {
            opacity: 0;
            transform: scale(0.78);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .pf-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .pf-section-title-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f3d1dc;
          background: #fff1f6;
          color: #c8507a;
        }
        .pf-outline-accent-btn {
          transition: all 0.2s ease;
          background: #ffffff;
          color: #c8507a;
          border: 1px solid #c8507a;
          border-radius: 10px;
          padding: 8px 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          white-space: nowrap;
        }
        .pf-outline-accent-btn:hover {
          background: #fff1f6;
        }
        .pf-image-link-btn {
          transition: all 0.2s ease;
          background: #ffffff;
          color: #c8507a;
          border: 1px solid #e4e4e7;
          border-radius: 10px;
          height: 44px;
          padding: 0 24px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          white-space: nowrap;
          width: fit-content;
        }
        .pf-image-link-btn:hover {
          background: #f9fafb;
        }
        .pf-mini-plus-btn {
          height: 24px;
          border: 1px solid #c8507a;
          border-radius: 8px;
          background: #ffffff;
          color: #c8507a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
          padding: 0 8px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          font-family: 'Poppins', sans-serif;
        }
        .pf-mini-plus-btn:hover {
          background: #fff1f6;
        }
        .pf-ghost-back-btn {
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #18181b;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pf-ghost-back-btn:hover {
          background: #27272a;
          color: #ffffff;
        }
        .pf-ghost-action-btn {
          height: 40px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fff1f2;
          color: #dc2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pf-ghost-action-btn:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
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
        zIndex: 120,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '12px 28px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        borderBottom: '1px solid #f4f4f5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', minWidth: 0 }}>
          <button
            type="button"
            className="pf-ghost-back-btn"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', minWidth: 0 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#18181b', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
          <button
            type="button"
            className="pf-ghost-action-btn"
            onClick={() => navigate('/products')}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            Discard
          </button>
          <button
            type="button"
            style={{
              background: saving ? '#888' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              height: 40,
              padding: '0 20px',
              fontSize: 15,
              fontWeight: 600,
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
      </div>

      <div style={{ maxWidth: 1120, margin: '36px auto 0' }}>
        <div className="pf-step-layout">
          <aside
            style={{
              position: 'sticky',
              top: 86,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #eceff3',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              padding: '18px 16px',
            }}
          >
            {STEPS.map((step, idx) => {
              const completed = Boolean(stepDone[step.key]);
              const active = idx === activeIdx;
              const lineColor = completed ? '#86efac' : '#e4e4e7';

              return (
                <div key={step.key} style={{ position: 'relative', paddingBottom: idx < STEPS.length - 1 ? 26 : 0 }}>
                  {idx < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 15,
                        top: 32,
                        width: 1,
                        height: 26,
                        background: lineColor,
                      }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab(step.key)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: completed ? '1px solid #bbf7d0' : active ? 'none' : '1px solid #d4d4d8',
                        background: completed ? '#f0fdf4' : active ? '#c8507a' : '#f4f4f5',
                        color: completed ? '#16a34a' : active ? '#ffffff' : '#9ca3af',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {completed ? <span className="pf-check-anim"><Check size={16} /></span> : idx + 1}
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: active ? 700 : completed ? 600 : 500,
                        color: active ? '#111827' : completed ? '#374151' : '#9ca3af',
                      }}
                    >
                      {step.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </aside>

          <section>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eceff3',
                padding: '34px 36px',
              }}
            >
              <div key={activeTab} className="pf-step-pane">
              {activeTab === 'general' && (
                <>
                  <div className="pf-section-title">
                    <span className="pf-section-title-icon"><Info size={16} /></span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>General Details</h3>
                  </div>
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
                      <div className="pf-select-wrap">
                        <select
                          className="custom-input pf-select"
                          value={audience}
                          onChange={aud => setAudience(aud.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                          required
                        >
                          <option value="unisex">Unisex</option>
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                          <option value="kids">Kids</option>
                        </select>
                        <ChevronDown size={16} className="pf-select-icon" style={{ top: 'calc(50% + 2px)' }} />
                      </div>
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

                  <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        Category
                        <button type="button" className="pf-mini-plus-btn" onClick={() => openQuickAdd('category')} title="Quick add category">
                          <span>+</span>
                        </button>
                      </label>
                      <div className="pf-select-wrap">
                        <select
                          className="custom-input pf-select"
                          value={categoryId}
                          onChange={e => {
                            setCategoryId(e.target.value);
                            setSubcategoryId('');
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                          required
                        >
                          <option value="" disabled hidden>Select category</option>
                          {categories.filter(c => c.parent_id === null).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="pf-select-icon" />
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, color: !categoryId ? '#aaa' : '#000', display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        Subcategory
                        <button
                          type="button"
                          className="pf-mini-plus-btn"
                          onClick={() => openQuickAdd('subcategory')}
                          title="Quick add subcategory"
                        >
                          <span>+</span>
                        </button>
                      </label>
                      <div className="pf-select-wrap">
                        <select
                          className="custom-input pf-select"
                          value={subcategoryId}
                          onChange={e => setSubcategoryId(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', opacity: (!categoryId || isSubcategoriesLoading) ? 0.6 : 1, background: (!categoryId || isSubcategoriesLoading) ? '#f5f6fa' : '#fff' }}
                          disabled={!categoryId || isSubcategoriesLoading}
                        >
                          <option value="">{isSubcategoriesLoading ? 'Loading subcategories...' : 'Select subcategory'}</option>
                          {subcategoriesOptions.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="pf-select-icon" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'specifications' && (
                <>
                  <div className="pf-section-title">
                    <span className="pf-section-title-icon"><Layers size={16} /></span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Specifications</h3>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label style={{ fontWeight: 500 }}>Product Specifications</label>
                    {specs.map((spec, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
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
                    <button type="button" className="pf-outline-accent-btn" onClick={addSpec} style={{ marginTop: 8 }}><Plus size={14} />Add Specification</button>
                  </div>
                </>
              )}

              {activeTab === 'media' && (
                <>
                  <div className="pf-section-title">
                    <span className="pf-section-title-icon"><Image size={16} /></span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Media</h3>
                  </div>
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

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontWeight: 500 }}>Gallery Image URLs</label>
                    {galleryImages.map((img, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
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
                    <button type="button" className="pf-image-link-btn" onClick={addGalleryImage} style={{ marginTop: 4 }}><Plus size={14} />Add Image Link</button>
                  </div>

                  {galleryImages.filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                      {galleryImages.filter(Boolean).map((img, i) => (
                        <img key={i} src={img} alt="Gallery" style={{ maxWidth: 90, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                      ))}
                    </div>
                  )}
                  <div style={{ color: '#888', fontSize: 14, marginTop: 16 }}>
                    (Paste Cloudinary image links. You can add as many as you want.)
                  </div>
                </>
              )}

              {activeTab === 'inventory' && (
                <>
                  <div className="pf-section-title">
                    <span className="pf-section-title-icon"><Box size={16} /></span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Inventory</h3>
                  </div>
                  <label style={{ fontWeight: 600, marginBottom: 16, display: 'block', fontSize: 13, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>Product Variants</label>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Size</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Color</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Price</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Stock</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>SKU</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Image</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantRows.map((variant, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                          <td style={{ padding: '5px 0' }}><input className="custom-input" type="text" value={variant.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                          <td style={{ padding: '5px 0' }}><input className="custom-input" type="text" value={variant.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} style={{ width: 90, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                          <td style={{ padding: '5px 0' }}><input className="custom-input" type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} style={{ width: 70, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
                          <td style={{ padding: '5px 0' }}><input className="custom-input" type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(idx, 'stock', e.target.value)} style={{ width: 60, padding: 4, borderRadius: 12, border: '1px solid #a0a0a0' }} /></td>
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
                  <button type="button" className="pf-outline-accent-btn" onClick={addVariant}><Plus size={14} />Add Variant</button>
                </>
              )}

              {activeTab === 'galleries' && (
                <>
                  <div className="pf-section-title">
                    <span className="pf-section-title-icon"><Image size={16} /></span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Design Specific Galleries</h3>
                  </div>
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
                          <div style={{ display: 'grid', gap: 8 }}>
                            {designGalleries.map((gallery) => (
                              <div key={gallery.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
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
                </>
              )}
              </div>

              <div style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #eef0f3', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={!canPrev}
                  style={{
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d4d4d8',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: canPrev ? 'pointer' : 'not-allowed',
                    opacity: canPrev ? 1 : 0.5,
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNext}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: canNext ? 'pointer' : 'not-allowed',
                    opacity: canNext ? 1 : 0.5,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;

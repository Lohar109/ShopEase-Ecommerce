import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, X } from 'lucide-react';

const normalizeId = (value) => String(value ?? '').trim();

const buildProductOptions = (productsInput) => {
  try {
    const products = Array.isArray(productsInput) ? productsInput.filter(Boolean) : [];
    console.log('[ProductMultiSelect] buildProductOptions input:', { count: products.length, firstProduct: products[0] });

    const guessId = (obj) => {
      if (!obj || typeof obj !== 'object') return '';
      const candidates = ['_id', 'id', 'product_id', 'productId', 'sku_id'];
      for (const key of candidates) {
        if (obj[key]) {
          const val = normalizeId(obj[key]);
          if (val) return val;
        }
      }
      // try nested product object
      if (obj.product && typeof obj.product === 'object') return guessId(obj.product);
      // fallback: try first string/number prop
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'string' || typeof v === 'number') {
          const val = normalizeId(v);
          if (val) return val;
        }
      }
      return '';
    };

    const guessName = (obj) => {
      if (!obj || typeof obj !== 'object') return 'Unnamed';
      const candidates = ['name', 'title', 'product_name', 'displayName', 'label'];
      for (const key of candidates) {
        if (obj[key]) {
          const val = String(obj[key]).trim();
          if (val && val.length > 0) return val;
        }
      }
      if (obj.product && typeof obj.product === 'object') return guessName(obj.product);
      // fallback to id if name not found
      const id = guessId(obj);
      return id || 'Unnamed';
    };

    const guessSku = (obj) => {
      if (!obj || typeof obj !== 'object') return '';
      const candidates = ['sku', 'sku_code', 'variant_sku', 'product_sku'];
      for (const key of candidates) {
        if (obj[key]) {
          const val = String(obj[key]).trim();
          if (val) return val;
        }
      }
      if (obj.product && typeof obj.product === 'object') return guessSku(obj.product);
      return '';
    };

    const options = products.map((p, idx) => {
      const id = guessId(p);
      if (!id) return null;
      const name = guessName(p);
      const sku = guessSku(p);
      const label = sku ? `${name} (SKU: ${sku})` : name;

      // Log first few products for debugging
      if (idx < 3) {
        console.log(`[ProductMultiSelect] Product #${idx + 1}:`, { id, name, sku, label, rawProduct: p });
      }

      return {
        value: id,
        label,
        name,
        sku,
        product: p,
      };
    }).filter(Boolean);

    console.log('[ProductMultiSelect] Built options:', { total: options.length, samples: options.slice(0, 3) });
    return options.sort((a, b) => a.label.localeCompare(b.label));
  } catch (err) {
    console.error('Failed to build product options', err, productsInput);
    return [];
  }
};

// Try to find an array of objects anywhere inside the response object
const extractListFromResponse = (data, depth = 0) => {
  if (!data || depth > 4) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val)) return val;
  }
  // recurse one level deep
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === 'object') {
      const found = extractListFromResponse(val, depth + 1);
      if (found && found.length) return found;
    }
  }
  return [];
};

const ProductMultiSelect = ({ value = [], onChange, placeholder = 'Select products...', loading: loadingProp = false, disabled = false, open = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(Boolean(loadingProp));
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredValue, setHoveredValue] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // fetch function exposed to multiple effects
  const loadProducts = async () => {
    let mounted = true;
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      let data = null;
      const contentType = res.headers.get('content-type') || '';
      setFetchError('');
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (parseErr) {
          console.error('Failed to parse products response', parseErr);
          data = null;
          setFetchError('Failed to parse JSON response from products API.');
        }
      } else {
        // Read raw text for debugging (likely HTML error page or redirect)
        const raw = await res.text();
        const snippet = String(raw || '').slice(0, 1000);
        console.warn('Products API returned non-JSON response, skipping JSON parse', contentType, snippet);
        setFetchError(`Products API returned non-JSON response (${contentType}). See console/network for details.`);
      }
      console.log('[ProductMultiSelect] API Response:', { status: res.status, contentType, dataType: typeof data, isArray: Array.isArray(data), dataLength: Array.isArray(data) ? data.length : 'N/A', firstItem: Array.isArray(data) ? data[0] : null, fullData: data });
      if (!mounted) return;
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const list = extractListFromResponse(data);
      console.log('[ProductMultiSelect] Extracted list:', { count: list.length, firstItem: list[0] });
      setProducts(list.map((p) => ({ ...p })));
      if (list.length === 0 && !fetchError && res.ok) {
        // no items found but no explicit error
        setFetchError('No products returned by the API.');
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial mount fetch
    loadProducts();
  }, []);

  useEffect(() => {
    // also fetch when dropdown is opened (e.g., Limits step active)
    if (open && products.length === 0 && !loading) {
      loadProducts();
    }
  }, [open]);

  const { options } = useMemo(() => ({ options: buildProductOptions(products) }), [products]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (String(o.label || '').toLowerCase().includes(q) || String(o.name || '').toLowerCase().includes(q) || String(o.sku || '').toLowerCase().includes(q)));
  }, [options, searchTerm]);

  const selectedOptions = useMemo(() => options.filter((o) => value.includes(o.value)), [options, value]);

  const updateMenuPosition = () => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const margin = 8;
    const estimatedMenuHeight = 320;
    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
    const availableHeight = openUp ? Math.max(180, spaceAbove) : Math.max(180, spaceBelow);
    const width = Math.max(280, Math.min(rect.width, viewportWidth - margin * 2));
    const left = Math.max(margin, Math.min(rect.left, viewportWidth - width - margin));
    const top = openUp
      ? Math.max(margin, rect.top - Math.min(estimatedMenuHeight, availableHeight) - 4)
      : Math.min(viewportHeight - margin, rect.bottom + 4);

    setMenuPosition({ top, left, width, openUp, maxHeight: Math.min(estimatedMenuHeight, availableHeight) });
  };

  const handleSelect = (id) => {
    const newValue = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(newValue);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const target = event.target;
      const isInsideTrigger = Boolean(containerRef.current && (containerRef.current.contains(target) || path.includes(containerRef.current)));
      const isInsideMenu = Boolean(menuRef.current && (menuRef.current.contains(target) || path.includes(menuRef.current)));
      if (isInsideTrigger || isInsideMenu) return;
      setIsOpen(false);
    };

    const handleEscape = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const sync = () => updateMenuPosition();
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const containerStyle = { position: 'relative', width: '100%' };
  const triggerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', minHeight: '40px', padding: '8px 12px', border: '1px solid #d4d4d8', borderRadius: '8px', background: disabled ? '#f9fafb' : '#ffffff', cursor: (loading || disabled) ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'Poppins, sans-serif', opacity: disabled ? 0.6 : 1
  };

  const selectedTagsWrapStyle = { display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1, alignItems: 'center' };
  const tagStyle = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#374151', whiteSpace: 'nowrap' };
  const tagRemoveButtonStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0px', background: 'transparent', border: 'none', color: '#6b7280' };

  const menuShellStyle = { position: 'fixed', top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, width: `${menuPosition.width}px`, zIndex: 10000, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.16)', overflow: 'hidden' };
  const searchInputStyle = { width: '100%', padding: '10px 12px', border: 'none', borderBottom: '1px solid #e5e7eb', borderRadius: '8px 8px 0 0', fontSize: '14px', fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#ffffff' };

  const optionItemStyle = (isSelected, isHovered) => ({ padding: '10px 12px', cursor: 'pointer', background: isHovered ? '#f9fafb' : isSelected ? '#f0f9ff' : '#ffffff', borderLeft: isSelected ? '3px solid #c8507a' : '3px solid transparent', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: isSelected ? '#c8507a' : '#374151', fontWeight: isSelected ? '600' : '500', transition: 'background 0.15s ease', boxSizing: 'border-box', width: '100%' });

  const checkboxStyle = { width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #d4d4d8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', flexShrink: 0 };

  const emptyStateStyle = { padding: '16px 12px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' };
  const loadingStateStyle = { padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' };

  const renderMenu = () => {
    if (!isOpen) return null;
    return createPortal(
      <div ref={menuRef} style={menuShellStyle}>
        <input ref={inputRef} type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchInputStyle} />
        <div style={{ maxHeight: `${menuPosition.maxHeight || 300}px`, overflowY: 'auto' }}>
          {loading ? (
            <div style={loadingStateStyle}><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Loading products...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt.value);
              const isHovered = hoveredValue === opt.value;
              return (
                <div key={opt.value} style={optionItemStyle(isSelected, isHovered)} onClick={() => handleSelect(opt.value)} onMouseEnter={() => setHoveredValue(opt.value)} onMouseLeave={() => setHoveredValue('')}>
                  <div style={{ ...checkboxStyle, background: isSelected ? '#c8507a' : '#ffffff', borderColor: isSelected ? '#c8507a' : '#d4d4d8' }}>{isSelected && <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}</div>
                  <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center' }}>{opt.label}</span>
                </div>
              );
            })
          ) : (
            <div style={emptyStateStyle}>{fetchError || 'No products found'}</div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      <button ref={triggerRef} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { if (loading || disabled) return; setIsOpen((p) => !p); }} style={triggerStyle} disabled={loading || disabled}>
        <div style={selectedTagsWrapStyle}>
          {loading ? (<span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Loading products...</span>) : selectedOptions.length > 0 ? (selectedOptions.map((opt) => (
            <div key={opt.value} style={tagStyle}>
              <span>{opt.label}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onChange(value.filter((id) => id !== opt.value)); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onChange(value.filter((id) => id !== opt.value)); } }}
                style={tagRemoveButtonStyle}
              ><X size={14} /></span>
            </div>
          ))) : (<span style={{ color: '#9ca3af' }}>{placeholder}</span>) }
        </div>
        <ChevronDown size={16} style={{ color: '#6b7280', flexShrink: 0, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {renderMenu()}
    </div>
  );
};

export default ProductMultiSelect;

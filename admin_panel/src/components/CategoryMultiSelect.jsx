import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, X } from 'lucide-react';

const normalizeId = (value) => String(value ?? '').trim();

const getCategoryId = (category) => normalizeId(category?._id ?? category?.id);

const getCategoryName = (category) => String(category?.name || category?.label || 'Unknown');

const buildCategoryOptions = (categoriesInput) => {
  try {
    const categories = Array.isArray(categoriesInput) ? categoriesInput.filter(Boolean) : [];
    const categoryMap = new Map();

    categories.forEach((category) => {
      const categoryId = getCategoryId(category);
      if (!categoryId) return;
      categoryMap.set(categoryId, category);
    });

    const buildPath = (category, visited = new Set()) => {
      if (!category) return ['Unknown'];

      const categoryId = getCategoryId(category);
      const safeName = getCategoryName(category);

      if (!categoryId || visited.has(categoryId)) {
        return [safeName || 'Unknown'];
      }

      const nextVisited = new Set(visited);
      nextVisited.add(categoryId);

      const parentId = normalizeId(category?.parent_id ?? category?.parentId);
      const parent = parentId ? categoryMap.get(parentId) : null;

      if (!parent) {
        return [safeName || 'Unknown'];
      }

      const parentPath = buildPath(parent, nextVisited);
      return [...parentPath, safeName || 'Unknown'];
    };

    const options = categories.map((category) => {
      const categoryId = getCategoryId(category);
      if (!categoryId) return null;

      const path = buildPath(category);
      const label = path.filter(Boolean).join(' > ') || 'Unknown';

      return {
        value: categoryId,
        label,
        name: getCategoryName(category),
        category,
      };
    }).filter(Boolean);

    return options.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Failed to build category options:', error, categoriesInput);
    return [];
  }
};

const CategoryMultiSelect = ({
  categories = [],
  value = [],
  onChange,
  placeholder = 'Select categories...',
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredValue, setHoveredValue] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const { options, buildError } = useMemo(() => {
    try {
      return {
        options: buildCategoryOptions(categories),
        buildError: ''
      };
    } catch (error) {
      console.error('Unexpected category option error:', error, categories);
      return {
        options: [],
        buildError: 'Unable to load categories'
      };
    }
  }, [categories]);

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => String(option?.label || '').toLowerCase().includes(query));
  }, [options, searchTerm]);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

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

    setMenuPosition({
      top,
      left,
      width,
      openUp,
      maxHeight: Math.min(estimatedMenuHeight, availableHeight),
    });
  };

  const handleSelect = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  const handleRemove = (optionId) => {
    onChange(value.filter((id) => id !== optionId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const syncPosition = () => updateMenuPosition();
    syncPosition();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);

    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const containerStyle = {
    position: 'relative',
    width: '100%',
  };

  const triggerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    minHeight: '40px',
    padding: '8px 12px',
    border: '1px solid #d4d4d8',
    borderRadius: '8px',
    background: '#ffffff',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
  };

  const selectedTagsWrapStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
    alignItems: 'center',
  };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    whiteSpace: 'nowrap',
  };

  const tagRemoveButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
  };

  const menuShellStyle = {
    position: 'fixed',
    top: `${menuPosition.top}px`,
    left: `${menuPosition.left}px`,
    width: `${menuPosition.width}px`,
    zIndex: 10000,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.16)',
    overflow: 'hidden',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    borderBottom: '1px solid #e5e7eb',
    borderRadius: '8px 8px 0 0',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
    background: '#ffffff',
  };

  const optionItemStyle = (isSelected, isHovered) => ({
    padding: '10px 12px',
    cursor: 'pointer',
    background: isHovered ? '#f9fafb' : isSelected ? '#f0f9ff' : '#ffffff',
    borderLeft: isSelected ? '3px solid #c8507a' : '3px solid transparent',
    paddingLeft: '9px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: isSelected ? '#c8507a' : '#374151',
    fontWeight: isSelected ? '600' : '500',
    transition: 'background 0.15s ease',
  });

  const checkboxStyle = {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #d4d4d8',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    flexShrink: 0,
  };

  const emptyStateStyle = {
    padding: '16px 12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  };

  const loadingStateStyle = {
    padding: '16px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#6b7280',
    fontSize: '14px',
  };

  const renderMenu = () => {
    if (!isOpen) return null;

    return createPortal(
      <div ref={menuRef} style={menuShellStyle}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />

        <div style={{ maxHeight: `${menuPosition.maxHeight || 300}px`, overflowY: 'auto' }}>
          {loading ? (
            <div style={loadingStateStyle}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading categories...
            </div>
          ) : buildError ? (
            <div style={emptyStateStyle}>{buildError}</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt.value);
              const isHovered = hoveredValue === opt.value;

              return (
                <div
                  key={opt.value}
                  style={optionItemStyle(isSelected, isHovered)}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHoveredValue(opt.value)}
                  onMouseLeave={() => setHoveredValue('')}
                >
                  <div style={{
                    ...checkboxStyle,
                    background: isSelected ? '#c8507a' : '#ffffff',
                    borderColor: isSelected ? '#c8507a' : '#d4d4d8'
                  }}>
                    {isSelected && <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                </div>
              );
            })
          ) : (
            <div style={emptyStateStyle}>
              No categories found
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (loading) return;
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => {
          if (!loading) setIsOpen(true);
        }}
        style={triggerStyle}
        disabled={loading}
      >
        <div style={selectedTagsWrapStyle}>
          {loading ? (
            <span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading categories...
            </span>
          ) : buildError ? (
            <span style={{ color: '#dc2626' }}>{buildError}</span>
          ) : selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <div key={opt.value} style={tagStyle}>
                <span>{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(opt.value);
                  }}
                  style={tagRemoveButtonStyle}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <span style={{ color: '#9ca3af' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: '#6b7280',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {renderMenu()}
    </div>
  );
};

export default CategoryMultiSelect;

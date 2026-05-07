import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * Builds a flat list of options from hierarchical categories
 * Each option includes the full path and the original category object
 */
const buildCategoryOptions = (categories) => {
  const options = [];
  
  const findPath = (id, path = []) => {
    const category = categories.find(c => c.id === id);
    if (!category) return path;
    
    const newPath = [category, ...path];
    if (!category.parent_id) return newPath;
    return findPath(category.parent_id, newPath);
  };

  categories.forEach(cat => {
    const path = findPath(cat.id);
    const label = path.map(c => c.name).join(' > ');
    options.push({
      id: cat.id,
      name: cat.name,
      label,
      category: cat
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label));
};

const CategoryMultiSelect = ({ 
  categories = [], 
  value = [], 
  onChange, 
  placeholder = 'Select categories...' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const options = buildCategoryOptions(categories);
  
  const filteredOptions = searchTerm.trim() === '' 
    ? options 
    : options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const selectedOptions = options.filter(opt => value.includes(opt.id));

  const handleSelect = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  const handleRemove = (optionId) => {
    onChange(value.filter(id => id !== optionId));
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerStyle = {
    position: 'relative',
    width: '100%'
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
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif'
  };

  const selectedTagsWrapStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
    alignItems: 'center'
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
    whiteSpace: 'nowrap'
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
    transition: 'color 0.2s ease'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    borderBottom: '1px solid #e5e7eb',
    borderRadius: '8px 8px 0 0',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none'
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
    transition: 'background 0.15s ease'
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
    flexShrink: 0
  };

  const emptyStateStyle = {
    padding: '16px 12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={triggerStyle}
        onFocus={() => setIsOpen(true)}
      >
        <div style={selectedTagsWrapStyle}>
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <div key={opt.id} style={tagStyle}>
                <span>{opt.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(opt.id);
                  }}
                  style={tagRemoveButtonStyle}
                  onMouseEnter={(e) => e.target.style.color = '#374151'}
                  onMouseLeave={(e) => e.target.style.color = '#6b7280'}
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

      {isOpen && (
        <div style={dropdownStyle}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            autoFocus
          />
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.id);
                const [isHovered, setIsHovered] = React.useState(false);
                
                return (
                  <div
                    key={opt.id}
                    style={optionItemStyle(isSelected, isHovered)}
                    onClick={() => handleSelect(opt.id)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
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
        </div>
      )}
    </div>
  );
};

export default CategoryMultiSelect;

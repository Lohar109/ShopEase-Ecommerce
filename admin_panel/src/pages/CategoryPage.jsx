import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { addCategory, deleteCategory, fetchCategories } from '../services/categoryService';

const CategoryPage = () => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1100);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryImage, setNewSubcategoryImage] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [addingSubcategory, setAddingSubcategory] = useState(false);

  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);

  const loadCategories = async () => {
    try {
      setError('');
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const onResize = () => setIsNarrowScreen(window.innerWidth < 1100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mainCategories = useMemo(
    () => categories.filter((category) => category?.parent_id === null),
    [categories]
  );

  const categoryById = useMemo(() => {
    const index = {};
    categories.forEach((category) => {
      if (category?.id) index[String(category.id)] = category;
    });
    return index;
  }, [categories]);

  const childCategories = useMemo(
    () => categories.filter((category) => category?.parent_id !== null),
    [categories]
  );

  const childrenByParentId = useMemo(() => {
    const group = {};
    childCategories.forEach((category) => {
      const parentId = String(category.parent_id);
      if (!group[parentId]) group[parentId] = [];
      group[parentId].push(category);
    });
    return group;
  }, [childCategories]);

  const toggleParentRow = (parentId) => {
    const normalizedParentId = String(parentId);
    setExpandedCategories((previous) => {
      if (previous.includes(normalizedParentId)) {
        return previous.filter((id) => id !== normalizedParentId);
      }
      return [...previous, normalizedParentId];
    });
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    if (!newCategoryName.trim() || !newCategoryImage.trim()) {
      alert('Please enter category name and image URL.');
      return;
    }

    setAddingCategory(true);
    try {
      await addCategory({
        name: newCategoryName.trim(),
        image: newCategoryImage.trim(),
        parent_id: null,
      });
      setNewCategoryName('');
      setNewCategoryImage('');
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSubcategory = async (event) => {
    event.preventDefault();
    if (!selectedParentId) {
      alert('Please choose a parent category.');
      return;
    }
    if (!newSubcategoryName.trim() || !newSubcategoryImage.trim()) {
      alert('Please enter subcategory name and image URL.');
      return;
    }

    setAddingSubcategory(true);
    try {
      await addCategory({
        name: newSubcategoryName.trim(),
        image: newSubcategoryImage.trim(),
        parent_id: selectedParentId,
      });
      setNewSubcategoryName('');
      setNewSubcategoryImage('');
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to add subcategory');
    } finally {
      setAddingSubcategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm('Are you sure? This will also delete all subcategories under it.');
    if (!confirmed) return;

    const categoryId = String(category?.id || '');
    if (!categoryId) return;

    setDeletingCategoryId(categoryId);
    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setDeletingCategoryId('');
    }
  };

  const hasAnyRows = mainCategories.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <Sidebar />

        <main
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: isNarrowScreen ? '1fr' : 'minmax(320px, 40%) minmax(460px, 60%)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <section style={{ position: isNarrowScreen ? 'static' : 'sticky', top: 24, display: 'grid', gap: 16 }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 2px 14px rgba(15, 23, 42, 0.08)',
                border: '1px solid #ececec',
                padding: 18,
              }}
            >
              <h2 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
                Add New Category
              </h2>

              <form onSubmit={handleAddCategory} style={{ display: 'grid', gap: 10 }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}
                  required
                />
                <input
                  type="text"
                  value={newCategoryImage}
                  onChange={(event) => setNewCategoryImage(event.target.value)}
                  placeholder="Category image URL"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}
                  required
                />
                <button
                  type="submit"
                  disabled={addingCategory}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontWeight: 600,
                    cursor: addingCategory ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 2px 14px rgba(15, 23, 42, 0.08)',
                border: '1px solid #ececec',
                padding: 18,
              }}
            >
              <h2 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
                Add New Subcategory
              </h2>

              <form onSubmit={handleAddSubcategory} style={{ display: 'grid', gap: 10 }}>
                <select
                  value={selectedParentId}
                  onChange={(event) => setSelectedParentId(event.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}
                  required
                >
                  <option value="">Select parent category</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSubcategoryName}
                  onChange={(event) => setNewSubcategoryName(event.target.value)}
                  placeholder="Subcategory name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}
                  required
                />
                <input
                  type="text"
                  value={newSubcategoryImage}
                  onChange={(event) => setNewSubcategoryImage(event.target.value)}
                  placeholder="Subcategory image URL"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}
                  required
                />
                <button
                  type="submit"
                  disabled={addingSubcategory}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontWeight: 600,
                    cursor: addingSubcategory ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addingSubcategory ? 'Saving...' : 'Save Subcategory'}
                </button>
              </form>
            </div>
          </section>

          <section
            style={{
              background: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 2px 14px rgba(15, 23, 42, 0.08)',
              border: '1px solid #ececec',
              padding: 22,
              minHeight: 520,
            }}
          >
            <h1 style={{ margin: '0 0 16px 0', fontSize: 28, fontWeight: 700, color: '#111827' }}>
              Category Management
            </h1>

            {loading ? (
              <div style={{ color: '#6b7280', padding: '18px 6px' }}>Loading categories...</div>
            ) : error ? (
              <div style={{ color: '#b91c1c', padding: '18px 6px' }}>{error}</div>
            ) : !hasAnyRows ? (
              <div style={{ color: '#6b7280', padding: '18px 6px' }}>No categories yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: 12, color: '#6b7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Name
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: 12, color: '#6b7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Type
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: 12, color: '#6b7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Hierarchy
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px 10px', fontSize: 12, color: '#6b7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainCategories.map((parentCategory) => {
                      const parentId = String(parentCategory.id);
                      const parentChildren = childrenByParentId[parentId] || [];
                      const isExpanded = expandedCategories.includes(parentId);
                      const isParentDeleting = deletingCategoryId === parentId;

                      return (
                        <React.Fragment key={parentId}>
                          <tr
                            style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: '#fafafa' }}
                            onClick={() => toggleParentRow(parentId)}
                          >
                            <td style={{ padding: '12px 10px', color: '#111827', fontWeight: 600 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                {parentCategory.name}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>Category</td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>{parentCategory.name}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteCategory(parentCategory);
                                }}
                                disabled={isParentDeleting}
                                style={{
                                  border: '1px solid #fecaca',
                                  background: isParentDeleting ? '#fee2e2' : '#fff1f2',
                                  color: '#b91c1c',
                                  borderRadius: 8,
                                  padding: '6px 9px',
                                  cursor: isParentDeleting ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                                title="Delete category"
                              >
                                <Trash2 size={14} />
                                {isParentDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>

                          {isExpanded &&
                            parentChildren.map((childCategory) => {
                              const childId = String(childCategory.id);
                              const isChildDeleting = deletingCategoryId === childId;
                              const parentName = categoryById[String(childCategory.parent_id)]?.name || '-';

                              return (
                                <tr key={childId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '12px 10px', color: '#111827', fontWeight: 500 }}>
                                    <span style={{ paddingLeft: 24 }}>{childCategory.name}</span>
                                  </td>
                                  <td style={{ padding: '12px 10px', color: '#475569' }}>Subcategory</td>
                                  <td style={{ padding: '12px 10px', color: '#475569' }}>{`${parentName} > ${childCategory.name}`}</td>
                                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(childCategory)}
                                      disabled={isChildDeleting}
                                      style={{
                                        border: '1px solid #fecaca',
                                        background: isChildDeleting ? '#fee2e2' : '#fff1f2',
                                        color: '#b91c1c',
                                        borderRadius: 8,
                                        padding: '6px 9px',
                                        cursor: isChildDeleting ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontWeight: 600,
                                        fontSize: 12,
                                      }}
                                      title="Delete category"
                                    >
                                      <Trash2 size={14} />
                                      {isChildDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;

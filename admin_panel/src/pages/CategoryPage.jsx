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
  const [searchTerm, setSearchTerm] = useState('');

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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const parentMatches = useMemo(() => {
    if (!normalizedSearchTerm) return [];
    return mainCategories.filter((category) =>
      String(category?.name || '').toLowerCase().includes(normalizedSearchTerm)
    );
  }, [mainCategories, normalizedSearchTerm]);

  const childMatches = useMemo(() => {
    if (!normalizedSearchTerm) return [];
    return childCategories.filter((category) =>
      String(category?.name || '').toLowerCase().includes(normalizedSearchTerm)
    );
  }, [childCategories, normalizedSearchTerm]);

  const displayedParents = useMemo(() => {
    if (!normalizedSearchTerm) return mainCategories;

    const parentIdsFromParentMatches = parentMatches.map((category) => String(category.id));
    const parentIdsFromChildMatches = childMatches.map((category) => String(category.parent_id));
    const visibleParentIds = new Set([...parentIdsFromParentMatches, ...parentIdsFromChildMatches]);

    return mainCategories.filter((category) => visibleParentIds.has(String(category.id)));
  }, [mainCategories, parentMatches, childMatches, normalizedSearchTerm]);

  const searchableChildrenByParentId = useMemo(() => {
    if (!normalizedSearchTerm) return childrenByParentId;

    const matchedChildren = {};

    displayedParents.forEach((parentCategory) => {
      const parentId = String(parentCategory.id);
      const parentMatched = parentMatches.some(
        (category) => String(category.id) === parentId
      );

      if (parentMatched) {
        matchedChildren[parentId] = childrenByParentId[parentId] || [];
        return;
      }

      matchedChildren[parentId] = childMatches.filter(
        (category) => String(category.parent_id) === parentId
      );
    });

    return matchedChildren;
  }, [childrenByParentId, childMatches, displayedParents, normalizedSearchTerm, parentMatches]);

  const effectiveExpandedCategories = useMemo(() => {
    if (!normalizedSearchTerm) return expandedCategories;

    const autoExpandedParentIds = displayedParents.map((category) => String(category.id));
    return Array.from(new Set([...expandedCategories, ...autoExpandedParentIds]));
  }, [displayedParents, expandedCategories, normalizedSearchTerm]);

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

  const hasAnyRows = displayedParents.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px 20px' }}>
      <style>{`
        .category-form {
          display: grid;
          gap: 20px;
        }

        .category-form-control {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          height: 44px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111827;
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
          outline: none;
        }

        .category-form-control:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.08);
        }

        .category-form-submit {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          height: 44px;
          border-radius: 8px;
        }

        .category-search-wrap {
          margin-bottom: 14px;
          max-width: 360px;
        }

        .category-search-input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          background: #fafafa;
          color: #111827;
          line-height: 1.2;
          height: 44px;
          padding: 0 14px;
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
          outline: none;
          box-shadow: none;
          appearance: none;
        }

        .category-search-input::placeholder {
          color: #a1a1aa;
        }

        .category-search-input:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.05);
          background: #ffffff;
        }

        .category-table-head-cell {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #71717a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .category-table-row {
          transition: background-color 200ms ease;
        }

        .category-table-row:hover {
          background: rgba(244, 244, 245, 0.5);
        }
      `}</style>

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
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(228,228,231,0.5)',
                padding: 24,
                overflow: 'hidden',
              }}
            >
              <h2 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
                Add New Category
              </h2>

              <form onSubmit={handleAddCategory} className="category-form space-y-5">
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
                  required
                />
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newCategoryImage}
                  onChange={(event) => setNewCategoryImage(event.target.value)}
                  placeholder="Category image URL"
                  required
                />
                <button
                  type="submit"
                  disabled={addingCategory}
                  className="category-form-submit"
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0 14px',
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(228,228,231,0.5)',
                padding: 24,
                overflow: 'hidden',
              }}
            >
              <h2 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
                Add New Subcategory
              </h2>

              <form onSubmit={handleAddSubcategory} className="category-form space-y-5">
                <select
                  className="category-form-control w-full box-border"
                  value={selectedParentId}
                  onChange={(event) => setSelectedParentId(event.target.value)}
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
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newSubcategoryName}
                  onChange={(event) => setNewSubcategoryName(event.target.value)}
                  placeholder="Subcategory name"
                  required
                />
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newSubcategoryImage}
                  onChange={(event) => setNewSubcategoryImage(event.target.value)}
                  placeholder="Subcategory image URL"
                  required
                />
                <button
                  type="submit"
                  disabled={addingSubcategory}
                  className="category-form-submit"
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0 14px',
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              border: '1px solid rgba(228,228,231,0.5)',
              padding: 22,
              minHeight: 520,
            }}
          >
            <h1 style={{ margin: '0 0 16px 0', fontSize: 28, fontWeight: 700, color: '#111827' }}>
              Category Management
            </h1>

            <div className="category-search-wrap">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search categories"
                className="category-search-input"
              />
            </div>

            {loading ? (
              <div style={{ color: '#6b7280', padding: '18px 6px' }}>Loading categories...</div>
            ) : error ? (
              <div style={{ color: '#b91c1c', padding: '18px 6px' }}>{error}</div>
            ) : !hasAnyRows ? (
              <div style={{ color: '#6b7280', padding: '18px 6px' }}>
                {normalizedSearchTerm ? 'No categories found.' : 'No categories yet.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                      <th className="category-table-head-cell">
                        Name
                      </th>
                      <th className="category-table-head-cell">
                        Type
                      </th>
                      <th className="category-table-head-cell">
                        Hierarchy
                      </th>
                      <th className="category-table-head-cell" style={{ textAlign: 'right' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedParents.map((parentCategory) => {
                      const parentId = String(parentCategory.id);
                      const parentChildren = searchableChildrenByParentId[parentId] || [];
                      const visibleChildren = parentChildren.filter((childCategory) =>
                        effectiveExpandedCategories.includes(String(childCategory.parent_id))
                      );
                      const isExpanded = effectiveExpandedCategories.includes(parentId);
                      const isParentDeleting = deletingCategoryId === parentId;

                      return (
                        <React.Fragment key={parentId}>
                          <tr
                            className="category-table-row"
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              background: isExpanded ? '#fafafa' : '#ffffff',
                            }}
                            onClick={() => toggleParentRow(parentId)}
                          >
                            <td style={{ padding: '12px 10px', color: '#111827', fontWeight: 600 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                {parentCategory.name}
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: 999,
                                    background: '#f4f4f5',
                                    color: '#3f3f46',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {parentChildren.length}
                                </span>
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  borderRadius: 999,
                                  background: '#e2e8f0',
                                  color: '#334155',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  lineHeight: 1.4,
                                }}
                              >
                                Parent
                              </span>
                            </td>
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
                            visibleChildren.map((childCategory) => {
                              const childId = String(childCategory.id);
                              const isChildDeleting = deletingCategoryId === childId;
                              const parentName = categoryById[String(childCategory.parent_id)]?.name || '-';

                              return (
                                <tr key={childId} className="category-table-row" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                  <td style={{ padding: '12px 10px', color: '#111827', fontWeight: 500 }}>
                                    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', paddingLeft: 48 }}>
                                      <span
                                        aria-hidden="true"
                                        style={{
                                          position: 'absolute',
                                          left: 24,
                                          top: -12,
                                          bottom: -12,
                                          width: 1,
                                          background: '#e4e4e7',
                                        }}
                                      />
                                      {childCategory.name}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 10px', color: '#475569' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: 999,
                                        background: '#ccfbf1',
                                        color: '#0f766e',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      Subcategory
                                    </span>
                                  </td>
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

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import TableSkeleton from '../components/TableSkeleton';
import { addCategory, deleteCategory, fetchCategories } from '../services/categoryService';

const CategoryPage = () => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1100);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [addingSubcategory, setAddingSubcategory] = useState(false);

  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
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

  const addCat = async (event) => {
    event.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Failed to add category.');
      return;
    }

    setAddingCategory(true);
    try {
      const res = await addCategory({
        name: newCategoryName.trim(),
        parent_id: null,
      });
      if (res) {
        toast.success('Category added successfully!', { position: 'top-center' });
      }
      setNewCategoryName('');
      await loadCategories();
    } catch (err) {
      toast.error('Failed to add category.');
    } finally {
      setAddingCategory(false);
    }
  };

  const addSubCat = async (event) => {
    event.preventDefault();
    if (!selectedParentId) {
      toast.error('Failed to add category.');
      return;
    }
    if (!newSubcategoryName.trim()) {
      toast.error('Failed to add category.');
      return;
    }

    setAddingSubcategory(true);
    try {
      const res = await addCategory({
        name: newSubcategoryName.trim(),
        parent_id: selectedParentId,
      });
      if (res) {
        toast.success('Category added successfully!', { position: 'top-center' });
      }
      setNewSubcategoryName('');
      await loadCategories();
    } catch (err) {
      toast.error('Failed to add category.');
    } finally {
      setAddingSubcategory(false);
    }
  };

  const openDeleteModal = (category) => {
    const categoryId = String(category?.id || '');
    if (!categoryId) return;

    setTargetId(categoryId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingCategoryId) return;
    setIsModalOpen(false);
    setTargetId('');
  };

  const handleDeleteCategory = async () => {
    if (!targetId) return;

    setDeletingCategoryId(targetId);
    try {
      await deleteCategory(targetId);
      await loadCategories();
      setIsModalOpen(false);
      setTargetId('');
      toast.success('Category deleted successfully', {
        position: 'top-center',
        icon: <Trash2 size={15} color="#dc2626" />,
        className: 'toast-pop',
        style: {
          border: '1px solid #fecaca',
          borderLeft: '4px solid #dc2626',
          background: '#ffffff',
          color: '#111827',
          borderRadius: '12px',
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.12)',
          padding: '10px 12px',
        },
      });
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setDeletingCategoryId('');
    }
  };

  const hasAnyRows = displayedParents.length > 0;

  return (
    <div>
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

        .category-parent-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 48px;
        }

        .category-parent-select-wrap {
          position: relative;
        }

        .category-parent-select-icon {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717a;
          pointer-events: none;
        }

        .category-form-submit {
          width: fit-content;
          max-width: none;
          box-sizing: border-box;
          height: auto;
          border-radius: 8px;
          justify-self: end;
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

      <main
        style={{
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

              <form onSubmit={addCat} className="category-form space-y-5">
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
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
                    padding: '8px 40px',
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

              <form onSubmit={addSubCat} className="category-form space-y-5">
                <div className="category-parent-select-wrap">
                  <select
                    className="category-form-control category-parent-select w-full box-border"
                    value={selectedParentId}
                    onChange={(event) => setSelectedParentId(event.target.value)}
                    required
                  >
                    <option value="">Select parent category</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="category-parent-select-icon" />
                </div>
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={newSubcategoryName}
                  onChange={(event) => setNewSubcategoryName(event.target.value)}
                  placeholder="Subcategory name"
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
                    padding: '8px 40px',
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

            {error ? (
              <div style={{ color: '#b91c1c', padding: '18px 6px' }}>{error}</div>
            ) : !loading && !hasAnyRows ? (
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
                  {loading ? (
                    <TableSkeleton
                      rows={5}
                      cols={4}
                      columns={['chevronName', 'type', 'text', 'actions']}
                    />
                  ) : (
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
                                  openDeleteModal(parentCategory);
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
                                          background: '#71717a',
                                        }}
                                      />
                                      <span
                                        aria-hidden="true"
                                        style={{
                                          position: 'absolute',
                                          left: 24,
                                          top: '50%',
                                          width: 16,
                                          height: 1,
                                          background: '#71717a',
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
                                      onClick={() => openDeleteModal(childCategory)}
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
                  )}
                </table>
              </div>
            )}
          </section>
      </main>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Are you sure?"
        message="This action cannot be undone. All subcategories under this will also be deleted."
        cancelLabel="Cancel"
        confirmLabel={deletingCategoryId ? 'Deleting...' : 'Delete'}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteCategory}
        isConfirming={Boolean(deletingCategoryId)}
      />
    </div>
  );
};

export default CategoryPage;

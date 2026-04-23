import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
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

  const [sName, setSName] = useState('');
  const [pId, setPId] = useState('');
  const [img, setImg] = useState('');
  const [addingSubcategory, setAddingSubcategory] = useState(false);

  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedParents, setExpandedParents] = useState({});

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

  const categoryById = useMemo(() => {
    const index = {};
    categories.forEach((category) => {
      if (category?.id) index[String(category.id)] = category;
    });
    return index;
  }, [categories]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const { pathById } = useMemo(() => {
    const p = {};

    const getPath = (id, seen = new Set()) => {
      const k = String(id || '');
      if (!k) return '';
      if (p[k]) return p[k];
      if (seen.has(k)) return String(categoryById[k]?.name || '');

      seen.add(k);
      const c = categoryById[k];
      if (!c) return '';

      const n = String(c.name || '').trim();
      const parentKey = c.parent_id ? String(c.parent_id) : '';
      if (!parentKey) {
        p[k] = n;
        return p[k];
      }

      const parentPath = getPath(parentKey, seen);
      p[k] = parentPath ? `${parentPath} > ${n}` : n;
      return p[k];
    };

    categories.forEach((c) => {
      const id = String(c.id || '');
      if (!id) return;
      getPath(id);
    });

    return { pathById: p };
  }, [categories, categoryById]);

  const orderedRows = useMemo(() => {
    return [...categories].sort((a, b) => {
      const ak = String(a?.id || '');
      const bk = String(b?.id || '');
      const ap = String(pathById[ak] || a?.name || '');
      const bp = String(pathById[bk] || b?.name || '');
      return ap.localeCompare(bp, undefined, { sensitivity: 'base' });
    });
  }, [categories, pathById]);

  const displayedRows = useMemo(() => {
    if (!normalizedSearchTerm) return orderedRows;
    return orderedRows.filter((c) => {
      const id = String(c?.id || '');
      const n = String(c?.name || '').toLowerCase();
      const p = String(pathById[id] || '').toLowerCase();
      return n.includes(normalizedSearchTerm) || p.includes(normalizedSearchTerm);
    });
  }, [orderedRows, normalizedSearchTerm, pathById]);

  const { parentRows, subRowsByParent } = useMemo(() => {
    const ps = orderedRows.filter((c) => c?.parent_id === null);
    const cs = orderedRows.filter((c) => c?.parent_id !== null);

    const filteredSet = new Set(displayedRows.map((c) => String(c?.id || '')));
    const parentIdsToShow = new Set();

    if (!normalizedSearchTerm) {
      ps.forEach((p) => parentIdsToShow.add(String(p.id)));
    } else {
      displayedRows.forEach((row) => {
        if (row?.parent_id === null) {
          parentIdsToShow.add(String(row.id));
          return;
        }
        const parentId = String(row.parent_id || '');
        if (parentId) parentIdsToShow.add(parentId);
      });
    }

    const parentList = ps.filter((p) => parentIdsToShow.has(String(p.id)));
    const childMap = {};

    parentList.forEach((p) => {
      const parentId = String(p.id);
      childMap[parentId] = cs.filter((child) => {
        const matchesParent = String(child.parent_id || '') === parentId;
        if (!matchesParent) return false;
        if (!normalizedSearchTerm) return true;
        return filteredSet.has(String(child.id)) || filteredSet.has(parentId);
      });
    });

    return { parentRows: parentList, subRowsByParent: childMap };
  }, [orderedRows, displayedRows, normalizedSearchTerm]);

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
    if (!pId) {
      toast.error('Failed to add category.');
      return;
    }
    if (!sName.trim()) {
      toast.error('Failed to add category.');
      return;
    }

    setAddingSubcategory(true);
    try {
      const res = await addCategory({
        name: sName.trim(),
        image: img.trim() || null,
        parent_id: pId,
      });
      if (res) {
        toast.success('Category added successfully!', { position: 'top-center' });
      }
      setSName('');
      setImg('');
      setPId('');
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

  const hasAnyRows = parentRows.length > 0;

  const toggleParent = (parentId) => {
    const key = String(parentId || '');
    if (!key) return;
    setExpandedParents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid #e4e4e7;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          font-family: Inter, "Plus Jakarta Sans", Poppins, sans-serif;
          font-weight: 400;
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
          outline: none;
        }

        .category-form-control::placeholder {
          color: #a1a1aa;
          opacity: 1;
          font-family: inherit;
          font-size: 14px;
          font-weight: 400;
        }

        .category-form-control:focus {
          border-color: #a1a1aa;
          box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.18);
        }

        .category-parent-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          height: 44px;
          padding-top: 10px;
          padding-bottom: 10px;
          padding-right: 48px;
          line-height: 1.5;
          border-color: #e4e4e7;
          background: #ffffff;
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

        .category-parent-toggle {
          border: none;
          background: transparent;
          padding: 0;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .category-parent-toggle-icon {
          color: #71717a;
          transition: transform 180ms ease;
          flex-shrink: 0;
        }

        .category-parent-toggle-icon.expanded {
          transform: rotate(180deg);
        }
      `}</style>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: isNarrowScreen ? '1fr' : 'minmax(320px, 1fr) minmax(720px, 2fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
          <section
            style={{
              position: isNarrowScreen ? 'static' : 'sticky',
              top: 24,
              display: 'grid',
              gap: 16,
              alignSelf: 'start',
            }}
          >
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
                    value={pId}
                    onChange={(event) => setPId(event.target.value)}
                    required
                  >
                    <option value="">Select parent category</option>
                    {orderedRows.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {pathById[String(cat.id)] || cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="category-parent-select-icon" />
                </div>
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={sName}
                  onChange={(event) => setSName(event.target.value)}
                  placeholder="Subcategory name"
                  required
                />
                <input
                  className="category-form-control w-full box-border"
                  type="text"
                  value={img}
                  onChange={(event) => setImg(event.target.value)}
                  placeholder="Subcategory image url"
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
                      <th className="category-table-head-cell" style={{ width: '32%' }}>
                        Name
                      </th>
                      <th className="category-table-head-cell">
                        Type
                      </th>
                      <th className="category-table-head-cell" style={{ width: '42%' }}>
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
                    {parentRows.map((parent) => {
                      const parentId = String(parent.id);
                      const isExpanded = Boolean(expandedParents[parentId]);
                      const parentPath = pathById[parentId] || String(parent.name || '-');
                      const parentDeleting = deletingCategoryId === parentId;
                      const childRows = subRowsByParent[parentId] || [];

                      return (
                        <React.Fragment key={parentId}>
                          <tr className="category-table-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 10px' }}>
                              <button
                                type="button"
                                className="category-parent-toggle"
                                onClick={() => toggleParent(parentId)}
                                aria-expanded={isExpanded}
                                title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                              >
                                <ChevronDown
                                  size={14}
                                  className={`category-parent-toggle-icon ${isExpanded ? 'expanded' : ''}`}
                                />
                                {parent.name}
                              </button>
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
                            <td style={{ padding: '12px 10px', color: '#475569' }}>{parentPath}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(parent)}
                                disabled={parentDeleting}
                                style={{
                                  border: '1px solid #fecaca',
                                  background: parentDeleting ? '#fee2e2' : '#fff1f2',
                                  color: '#b91c1c',
                                  borderRadius: 8,
                                  padding: '6px 9px',
                                  cursor: parentDeleting ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                                title="Delete category"
                              >
                                <Trash2 size={14} />
                                {parentDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && childRows.map((child) => {
                            const childId = String(child.id);
                            const childPath = pathById[childId] || String(child.name || '-');
                            const childDeleting = deletingCategoryId === childId;
                            return (
                              <tr key={childId} className="category-table-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 10px', color: '#111827', fontWeight: 500 }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: 26 }}>
                                    {child.name}
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
                                    Sub
                                  </span>
                                </td>
                                <td style={{ padding: '12px 10px', color: '#475569' }}>{childPath}</td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal(child)}
                                    disabled={childDeleting}
                                    style={{
                                      border: '1px solid #fecaca',
                                      background: childDeleting ? '#fee2e2' : '#fff1f2',
                                      color: '#b91c1c',
                                      borderRadius: 8,
                                      padding: '6px 9px',
                                      cursor: childDeleting ? 'not-allowed' : 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      fontWeight: 600,
                                      fontSize: 12,
                                    }}
                                    title="Delete category"
                                  >
                                    <Trash2 size={14} />
                                    {childDeleting ? 'Deleting...' : 'Delete'}
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

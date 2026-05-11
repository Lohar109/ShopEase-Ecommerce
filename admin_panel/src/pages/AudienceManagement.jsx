import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import TableSkeleton from '../components/TableSkeleton';
import { addAudience, deleteAudience, fetchAudiences, updateAudience } from '../services/audienceService';

const formatCreatedDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const AudienceManagement = () => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1100);
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newAudienceName, setNewAudienceName] = useState('');
  const [addingAudience, setAddingAudience] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState('');
  const [editingAudienceName, setEditingAudienceName] = useState('');
  const [updatingAudienceId, setUpdatingAudienceId] = useState('');
  const [audienceToDelete, setAudienceToDelete] = useState(null);
  const [deletingAudienceId, setDeletingAudienceId] = useState('');

  const loadAudiences = async () => {
    try {
      setError('');
      const data = await fetchAudiences();
      setAudiences(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load audiences');
      setAudiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudiences();
  }, []);

  useEffect(() => {
    const onResize = () => setIsNarrowScreen(window.innerWidth < 1100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const orderedRows = useMemo(() => {
    return [...audiences].sort((a, b) => {
      const ad = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b?.created_at ? new Date(b.created_at).getTime() : 0;
      if (ad !== bd) return bd - ad;
      return String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' });
    });
  }, [audiences]);

  const displayedRows = useMemo(() => {
    if (!normalizedSearchTerm) return orderedRows;
    return orderedRows.filter((audience) => {
      const name = String(audience?.name || '').toLowerCase();
      return name.includes(normalizedSearchTerm);
    });
  }, [orderedRows, normalizedSearchTerm]);

  const addAudienceHandler = async (event) => {
    event.preventDefault();
    const trimmedName = newAudienceName.trim();
    if (!trimmedName) {
      toast.error('Please enter an audience name.', { position: 'top-center' });
      return;
    }

    setAddingAudience(true);
    try {
      await addAudience({ name: trimmedName });
      setNewAudienceName('');
      await loadAudiences();
      toast.success('Audience added successfully!', { position: 'top-center' });
    } catch (err) {
      toast.error(err.message || 'Failed to add audience', { position: 'top-center' });
    } finally {
      setAddingAudience(false);
    }
  };

  const startEditAudience = (audience) => {
    const audienceId = String(audience?.id || '');
    if (!audienceId) return;

    setEditingAudienceId(audienceId);
    setEditingAudienceName(String(audience?.name || ''));
  };

  const cancelEditAudience = () => {
    setEditingAudienceId('');
    setEditingAudienceName('');
  };

  const handleSaveAudience = async (audienceId) => {
    const trimmedName = editingAudienceName.trim();
    if (!trimmedName) {
      toast.error('Audience name is required.', { position: 'top-center' });
      return;
    }

    setUpdatingAudienceId(audienceId);
    try {
      await updateAudience(audienceId, { name: trimmedName });
      await loadAudiences();
      cancelEditAudience();
      toast.success('Audience updated successfully!', { position: 'top-center' });
    } catch (err) {
      toast.error(err.message || 'Failed to update audience', { position: 'top-center' });
    } finally {
      setUpdatingAudienceId('');
    }
  };

  const openDeleteModal = (audience) => {
    const audienceId = String(audience?.id || '');
    if (!audienceId) return;
    setAudienceToDelete({ id: audienceId, name: audience?.name || '' });
  };

  const closeDeleteModal = () => {
    if (deletingAudienceId) return;
    setAudienceToDelete(null);
  };

  const handleDeleteAudience = async () => {
    if (!audienceToDelete) return;

    setDeletingAudienceId(audienceToDelete.id);
    try {
      await deleteAudience(audienceToDelete.id);
      await loadAudiences();
      setAudienceToDelete(null);
      toast.success('Audience deleted successfully!', { position: 'top-center' });
    } catch (err) {
      toast.error(err.message || 'Failed to delete audience', { position: 'top-center' });
    } finally {
      setDeletingAudienceId('');
    }
  };

  const hasAnyRows = displayedRows.length > 0;

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex' }}>
      <style>{`
        .audience-form {
          display: grid;
          gap: 20px;
        }

        .audience-form-control {
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

        .audience-form-control::placeholder {
          color: #a1a1aa;
          opacity: 1;
          font-family: inherit;
          font-size: 14px;
          font-weight: 400;
        }

        .audience-form-control:focus {
          border-color: #a1a1aa;
          box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.18);
        }

        .audience-form-submit {
          width: fit-content;
          max-width: none;
          box-sizing: border-box;
          height: auto;
          border-radius: 8px;
          justify-self: end;
        }

        .audience-search-wrap {
          margin-bottom: 14px;
          max-width: 360px;
        }

        .audience-search-input {
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

        .audience-search-input::placeholder {
          color: #a1a1aa;
        }

        .audience-search-input:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.05);
          background: #ffffff;
        }

        .audience-table-head-cell {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #71717a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .audience-table-row {
          transition: background-color 200ms ease;
        }

        .audience-table-row:hover {
          background: rgba(244, 244, 245, 0.5);
        }

        .audience-management-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
          min-height: 0;
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .audience-management-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .audience-management-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .audience-management-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 999px;
        }

        .audience-management-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: isNarrowScreen ? '1fr' : 'minmax(320px, 1fr) minmax(720px, 2fr)',
          gap: 20,
          alignItems: 'start',
          height: '100%',
          minHeight: 0,
        }}
      >
        <section
          style={{
            position: isNarrowScreen ? 'static' : 'sticky',
            top: 24,
            alignSelf: 'start',
            height: isNarrowScreen ? 'auto' : '100%',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Create Audience</h2>
              <Users size={18} color="#6b7280" />
            </div>

            <form onSubmit={addAudienceHandler} className="audience-form">
              <input
                className="audience-form-control w-full box-border"
                type="text"
                value={newAudienceName}
                onChange={(event) => setNewAudienceName(event.target.value)}
                placeholder="Audience name"
                required
              />
              <button
                type="submit"
                disabled={addingAudience}
                className="audience-form-submit"
                style={{
                  background: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 40px',
                  fontWeight: 600,
                  cursor: addingAudience ? 'not-allowed' : 'pointer',
                }}
              >
                {addingAudience ? 'Saving...' : 'Save Audience'}
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
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>Audience Management</h1>

            <div className="audience-search-wrap">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search audiences"
                className="audience-search-input"
              />
            </div>
          </div>

          {error ? (
            <div style={{ color: '#b91c1c', padding: '18px 6px' }}>{error}</div>
          ) : !loading && !hasAnyRows ? (
            <div style={{ color: '#6b7280', padding: '18px 6px' }}>
              {normalizedSearchTerm ? 'No audiences found.' : 'No audiences yet.'}
            </div>
          ) : (
            <div className="audience-management-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <th className="audience-table-head-cell" style={{ width: '46%' }}>Name</th>
                    <th className="audience-table-head-cell" style={{ width: '26%' }}>Created Date</th>
                    <th className="audience-table-head-cell" style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                {loading ? (
                  <TableSkeleton rows={5} cols={3} columns={['text', 'text', 'actions']} />
                ) : (
                  <tbody>
                    {displayedRows.map((audience) => {
                      const audienceId = String(audience.id);
                      const isEditing = editingAudienceId === audienceId;
                      const isUpdating = updatingAudienceId === audienceId;
                      const isDeleting = deletingAudienceId === audienceId;

                      return (
                        <tr key={audienceId} className="audience-table-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingAudienceName}
                                onChange={(event) => setEditingAudienceName(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    handleSaveAudience(audienceId);
                                  }
                                  if (event.key === 'Escape') {
                                    cancelEditAudience();
                                  }
                                }}
                                autoFocus
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  border: '1px solid #e4e4e7',
                                  borderRadius: 8,
                                  height: 40,
                                  padding: '0 14px',
                                  fontSize: 14,
                                  fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, sans-serif',
                                  outline: 'none',
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
                                {String(audience.name || '')}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#475569', verticalAlign: 'middle' }}>
                            {formatCreatedDate(audience.created_at)}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', verticalAlign: 'middle', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveAudience(audienceId)}
                                  disabled={isUpdating}
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    background: '#f9fafb',
                                    color: '#374151',
                                    borderRadius: 8,
                                    padding: '6px 9px',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                  }}
                                  title="Save audience"
                                >
                                  <Edit2 size={14} />
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditAudience}
                                  disabled={isUpdating}
                                  style={{
                                    border: '1px solid #fecaca',
                                    background: '#fff1f2',
                                    color: '#b91c1c',
                                    borderRadius: 8,
                                    padding: '6px 9px',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                  }}
                                  title="Cancel edit"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditAudience(audience)}
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    background: '#f9fafb',
                                    color: '#374151',
                                    borderRadius: 8,
                                    padding: '6px 9px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                  }}
                                  title="Edit audience"
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(audience)}
                                  disabled={isDeleting}
                                  style={{
                                    border: '1px solid #fecaca',
                                    background: isDeleting ? '#fee2e2' : '#fff1f2',
                                    color: '#b91c1c',
                                    borderRadius: 8,
                                    padding: '6px 9px',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                  }}
                                  title="Delete audience"
                                >
                                  <Trash2 size={14} />
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
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
        isOpen={Boolean(audienceToDelete)}
        title="Are you sure?"
        message={audienceToDelete ? `Delete audience "${audienceToDelete.name}"? This action cannot be undone.` : ''}
        cancelLabel="Cancel"
        confirmLabel={deletingAudienceId ? 'Deleting...' : 'Delete'}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteAudience}
        isConfirming={Boolean(deletingAudienceId)}
      />
    </div>
  );
};

export default AudienceManagement;
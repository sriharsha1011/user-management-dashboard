import { useState } from 'react';
import './App.css';
import { useUsers } from './hooks/useUsers';
import { useInfiniteScrollSentinel } from './hooks/useInfiniteScrollSentinel';
import UsersTable from './components/UsersTable';
import PaginationBar from './components/PaginationBar';
import FilterDrawer from './components/FilterDrawer';
import UserForm from './components/UserForm';
import ConfirmDialog from './components/ConfirmDialog';
import { IconSearch, IconFilter, IconPlus, IconX, IconAlert, IconLoader } from './components/Icons';

export default function App() {
  const {
    loading,
    error,
    mutationError,
    clearMutationError,
    reload,
    users,
    infiniteUsers,
    hasMore,
    loadMore,
    viewMode,
    setViewMode,
    totalCount,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    resetFilters,
    activeFilterCount,
    sort,
    setSort,
    addUser,
    editUser,
    removeUser,
  } = useUsers();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sentinelRef = useInfiniteScrollSentinel(loadMore, {
    enabled: viewMode === 'infinite' && hasMore && !loading,
  });

  function openAddForm() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEditForm(user) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function handleSave(values) {
    setSaving(true);
    const result = editingUser
      ? await editUser(editingUser.id, values)
      : await addUser(values);
    setSaving(false);
    if (result.ok) {
      setFormOpen(false);
      setEditingUser(null);
    }
    return result;
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await removeUser(deleteTarget.id);
    setDeleting(false);
    if (result.ok) {
      setDeleteTarget(null);
    }
  }

  function removeSingleFilter(key) {
    setFilters((f) => ({ ...f, [key]: '' }));
  }

  const displayedUsers = viewMode === 'infinite' ? infiniteUsers : users;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand-mark">UMD</span>
          <div>
            <h1 className="app-title">User Management Dashboard</h1>
            <p className="app-subtitle">Backed by JSONPlaceholder · /users</p>
          </div>
        </div>
        <div className="app-header-actions">
          <button type="button" className="btn btn-primary" onClick={openAddForm}>
            <IconPlus width={16} height={16} /> Add user
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="banner banner-error" role="alert">
            <IconAlert width={18} height={18} />
            <span>{error}</span>
            <button type="button" onClick={reload} className="btn-ghost" style={{ fontWeight: 700 }}>
              Retry
            </button>
          </div>
        )}

        {mutationError && (
          <div className="banner banner-error" role="alert">
            <IconAlert width={18} height={18} />
            <span>{mutationError}</span>
            <button type="button" onClick={clearMutationError} aria-label="Dismiss">
              <IconX width={16} height={16} />
            </button>
          </div>
        )}

        <div className="toolbar">
          <div className="search-field">
            <IconSearch width={16} height={16} />
            <input
              type="text"
              placeholder="Search name, email, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>

          <button type="button" className="btn btn-secondary" onClick={() => setFilterOpen(true)}>
            <IconFilter width={15} height={15} />
            Filters
            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          </button>

          <div className="filter-chip-bar">
            {Object.entries(filters)
              .filter(([, v]) => v.trim() !== '')
              .map(([key, value]) => (
                <span className="active-filter-pill" key={key}>
                  {key}: {value}
                  <button type="button" onClick={() => removeSingleFilter(key)} aria-label={`Remove ${key} filter`}>
                    <IconX width={12} height={12} />
                  </button>
                </span>
              ))}
            {activeFilterCount > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
                Clear all
              </button>
            )}
          </div>

          <div className="view-toggle" role="group" aria-label="Pagination mode">
            <button
              type="button"
              className={viewMode === 'paginated' ? 'active' : ''}
              onClick={() => setViewMode('paginated')}
            >
              Paginated
            </button>
            <button
              type="button"
              className={viewMode === 'infinite' ? 'active' : ''}
              onClick={() => setViewMode('infinite')}
            >
              Infinite scroll
            </button>
          </div>
        </div>

        <div className="table-card">
          <UsersTable
            users={displayedUsers}
            loading={loading}
            sort={sort}
            onSortChange={setSort}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
          />

          {!loading && viewMode === 'paginated' && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}

          {!loading && viewMode === 'infinite' && totalCount > 0 && (
            <div className="load-more-wrap" ref={sentinelRef}>
              {hasMore ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-soft)', fontSize: 13 }}>
                  <IconLoader width={15} height={15} /> Loading more…
                </span>
              ) : (
                <span style={{ color: 'var(--color-ink-soft)', fontSize: 13 }}>
                  Showing all {totalCount} user{totalCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        Mock data via JSONPlaceholder — add/edit/delete actions are simulated and not persisted server-side.
      </footer>

      {formOpen && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
          saving={saving}
        />
      )}

      {filterOpen && (
        <FilterDrawer
          filters={filters}
          onApply={setFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete user?"
          message={`This will remove ${deleteTarget.firstName} ${deleteTarget.lastName} from the list. This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}

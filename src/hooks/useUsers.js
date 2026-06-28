import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/usersApi';

const DEFAULT_FILTERS = { firstName: '', lastName: '', email: '', department: '' };

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ field: 'id', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('paginated'); // 'paginated' | 'infinite'
  const [infiniteCount, setInfiniteCount] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addUser = useCallback(async (userValues) => {
    setMutationError(null);
    try {
      const created = await createUser(userValues);
      setUsers((prev) => [created, ...prev]);
      return { ok: true };
    } catch (err) {
      const message = err.friendlyMessage || 'Failed to add user.';
      setMutationError(message);
      return { ok: false, message };
    }
  }, []);

  const editUser = useCallback(async (id, userValues) => {
    setMutationError(null);
    try {
      const updated = await updateUser(id, userValues);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return { ok: true };
    } catch (err) {
      const message = err.friendlyMessage || 'Failed to update user.';
      setMutationError(message);
      return { ok: false, message };
    }
  }, []);

  const removeUser = useCallback(async (id) => {
    setMutationError(null);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { ok: true };
    } catch (err) {
      const message = err.friendlyMessage || 'Failed to delete user.';
      setMutationError(message);
      return { ok: false, message };
    }
  }, []);

  // Search -> filter -> sort pipeline, recomputed only when inputs change.
  const processedUsers = useMemo(() => {
    let result = users;

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((u) =>
        [u.firstName, u.lastName, u.email, u.department]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }

    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim() !== '');
    if (activeFilters.length) {
      result = result.filter((u) =>
        activeFilters.every(([key, value]) =>
          (u[key] || '').toLowerCase().includes(value.trim().toLowerCase())
        )
      );
    }

    const { field, direction } = sort;
    result = [...result].sort((a, b) => {
      let av = a[field];
      let bv = b[field];
      if (field === 'id') {
        av = Number(av);
        bv = Number(bv);
      } else {
        av = (av || '').toLowerCase();
        bv = (bv || '').toLowerCase();
      }
      if (av < bv) return direction === 'asc' ? -1 : 1;
      if (av > bv) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, filters, sort]);

  const totalCount = processedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, safePage, pageSize]);

  const infiniteUsers = useMemo(
    () => processedUsers.slice(0, infiniteCount),
    [processedUsers, infiniteCount]
  );
  const hasMore = infiniteCount < totalCount;
  const loadMore = useCallback(() => {
    setInfiniteCount((c) => Math.min(c + pageSize, totalCount));
  }, [pageSize, totalCount]);

  // Reset to page 1 whenever the result set's shape changes meaningfully.
  useEffect(() => {
    setPage(1);
    setInfiniteCount(pageSize);
  }, [search, filters, pageSize, sort]);

  const activeFilterCount = Object.values(filters).filter((v) => v.trim() !== '').length;

  return {
    loading,
    error,
    mutationError,
    clearMutationError: () => setMutationError(null),
    reload: load,

    users: pagedUsers,
    infiniteUsers,
    hasMore,
    loadMore,
    viewMode,
    setViewMode,
    totalCount,
    totalPages,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,

    search,
    setSearch,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    activeFilterCount,

    sort,
    setSort,

    addUser,
    editUser,
    removeUser,
  };
}

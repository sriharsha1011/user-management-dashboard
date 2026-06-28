import { IconChevronUp, IconChevronDown, IconChevronsUpDown, IconEdit, IconTrash, IconUsers } from './Icons';

const COLUMNS = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'firstName', label: 'First name', sortable: true },
  { key: 'lastName', label: 'Last name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
];

function SortIcon({ active, direction }) {
  if (!active) return <IconChevronsUpDown width={13} height={13} />;
  return direction === 'asc' ? <IconChevronUp width={13} height={13} /> : <IconChevronDown width={13} height={13} />;
}

export default function UsersTable({ users, loading, sort, onSortChange, onEdit, onDelete }) {
  function handleSortClick(field) {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ field, direction: 'asc' });
    }
  }

  if (loading) {
    return (
      <div className="loading-state">Loading users…</div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <IconUsers width={32} height={32} />
        <h3>No users to show</h3>
        <p>Try adjusting your search or filters, or add a new user.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="users-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>
                {col.sortable ? (
                  <button
                    type="button"
                    className={`sort-btn ${sort.field === col.key ? 'active' : ''}`}
                    onClick={() => handleSortClick(col.key)}
                  >
                    {col.label}
                    <SortIcon active={sort.field === col.key} direction={sort.direction} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td data-label="ID" className="cell-id">{user.id}</td>
              <td data-label="First name" className="cell-name">{user.firstName}</td>
              <td data-label="Last name" className="cell-name">{user.lastName}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Department">
                {user.department ? <span className="cell-dept">{user.department}</span> : '—'}
              </td>
              <td data-label="Actions">
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(user)}
                  >
                    <IconEdit width={14} height={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(user)}
                  >
                    <IconTrash width={14} height={14} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

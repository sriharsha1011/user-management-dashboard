import { useState, useEffect } from 'react';
import { IconX } from './Icons';

const FIELDS = [
  { key: 'firstName', label: 'First name', placeholder: 'Ada' },
  { key: 'lastName', label: 'Last name', placeholder: 'Lovelace' },
  { key: 'email', label: 'Email', placeholder: 'ada@example.com' },
  { key: 'department', label: 'Department', placeholder: 'Engineering' },
];

export default function FilterDrawer({ filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => setDraft(filters), [filters]);

  function handleApply(e) {
    e.preventDefault();
    onApply(draft);
    onClose();
  }

  function handleClear() {
    const cleared = { firstName: '', lastName: '', email: '', department: '' };
    setDraft(cleared);
    onApply(cleared);
  }

  return (
    <div
      className="overlay drawer-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="filter-title">
        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header">
            <h2 id="filter-title">Filter users</h2>
            <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
              <IconX width={18} height={18} />
            </button>
          </div>

          <div className="ticket-tab">FILTER · TRAY · 0001</div>

          <div className="panel-body">
            {FIELDS.map(({ key, label, placeholder }) => (
              <div className="field" key={key}>
                <label htmlFor={`filter-${key}`}>{label}</label>
                <input
                  id={`filter-${key}`}
                  type="text"
                  placeholder={placeholder}
                  value={draft[key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="panel-footer spread">
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Clear all
            </button>
            <button type="submit" className="btn btn-primary">
              Apply filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

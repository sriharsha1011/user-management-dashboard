export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy }) {
  return (
    <div
      className="overlay modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-panel" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" style={{ maxWidth: 380 }}>
        <div className="panel-header">
          <h2 id="confirm-title">{title}</h2>
        </div>
        <div className="panel-body">
          <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14 }}>{message}</p>
        </div>
        <div className="panel-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function buildPageList(current, total) {
  // Show first, last, current +/-1, and ellipses for everything else
  // so the bar stays compact even with many pages.
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function PaginationBar({ page, totalPages, totalCount, pageSize, onPageChange, onPageSizeChange }) {
  const pageList = buildPageList(page, totalPages);

  return (
    <div className="pagination-bar">
      <span>
        {totalCount === 0
          ? 'No users found'
          : `${totalCount} user${totalCount === 1 ? '' : 's'} · page ${page} of ${totalPages}`}
      </span>

      <div className="pagination-controls">
        <label htmlFor="page-size" className="visually-hidden">Rows per page</label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>

        <button
          type="button"
          className="page-number-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageList.map((p, idx) => {
          const prev = pageList[idx - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {showEllipsis && <span aria-hidden="true">…</span>}
              <button
                type="button"
                className={`page-number-btn ${p === page ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          className="page-number-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

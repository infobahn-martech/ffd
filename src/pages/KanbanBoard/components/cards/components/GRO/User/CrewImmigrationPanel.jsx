import PropTypes from "prop-types";

export default function CrewImmigrationPanel({
  rows,
  batchOptions,
  activeBatch,
  onSelectBatch,
  loading,
  pagination,
  onPageChange,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeBatchOptions = Array.isArray(batchOptions) ? batchOptions : [];

  const currentPage = pagination?.page ?? 1;
  const limit = pagination?.limit || safeRows.length || 1;
  const total = pagination?.total ?? safeRows.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const pageStartDisplay = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const pageEndDisplay = Math.min(currentPage * limit, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goToPage = (pageNo) => {
    if (loading || pageNo < 1 || pageNo > totalPages || pageNo === currentPage) return;
    onPageChange?.(pageNo);
  };

  return (
    <div className="gro-crew-immigration-panel">
      {safeBatchOptions.length > 0 && (
        <div className="gro-crew-immigration-toolbar">
          <div className="gro-pass-segments" role="tablist" aria-label="Batch">
            {safeBatchOptions.map((b) => (
              <button
                key={b}
                type="button"
                role="tab"
                aria-selected={activeBatch === b}
                className={`gro-pass-segment${activeBatch === b ? " gro-pass-segment--active" : ""}`}
                onClick={() => onSelectBatch?.(b)}
                disabled={loading}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="gro-crew-immigration-table-wrap">
        <table className="gro-crew-immigration-table">
          <thead>
            <tr>
              <th>Crew Name</th>
              <th>Date of Birth</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Passport / Iqama</th>
              <th>Visa</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading…</td>
              </tr>
            ) : safeRows.length === 0 ? (
              <tr>
                <td colSpan={6}>No crew found.</td>
              </tr>
            ) : (
              safeRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.crewName}</td>
                  <td>{row.dateOfBirth}</td>
                  <td>{row.nationality}</td>
                  <td>{row.rank}</td>
                  <td>{row.passportIqama}</td>
                  <td>{row.visa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="gro-crew-immigration-pagination">
        <p className="gro-crew-immigration-pagination-text">
          {`Showing ${pageStartDisplay}-${pageEndDisplay} of ${total}`}
        </p>
        <div className="gro-crew-immigration-pagination-controls">
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={loading || currentPage === 1}
          >
            Previous
          </button>
          {pageNumbers.map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={`gro-crew-immigration-page-btn${pageNo === currentPage ? " gro-crew-immigration-page-btn--active" : ""}`}
              onClick={() => goToPage(pageNo)}
              disabled={loading}
            >
              {pageNo}
            </button>
          ))}
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={loading || currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

CrewImmigrationPanel.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  batchOptions: PropTypes.arrayOf(PropTypes.string),
  activeBatch: PropTypes.string,
  onSelectBatch: PropTypes.func,
  loading: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
    totalPages: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
};

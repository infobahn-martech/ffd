import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const ROWS_PER_PAGE = 5;

export default function CrewImmigrationPanel({ batches, loading }) {
  const safeBatches = Array.isArray(batches) ? batches : [];
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeBatchIndex]);

  useEffect(() => {
    if (activeBatchIndex !== 0 && activeBatchIndex >= safeBatches.length) {
      setActiveBatchIndex(0);
    }
  }, [safeBatches.length, activeBatchIndex]);

  const activeBatch = safeBatches[activeBatchIndex] ?? null;
  const rows = activeBatch?.rows ?? [];
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = rows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  const pageStartDisplay = totalRows === 0 ? 0 : startIndex + 1;
  const pageEndDisplay = Math.min(startIndex + ROWS_PER_PAGE, totalRows);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="gro-crew-immigration-panel">
      {safeBatches.length > 0 && (
        <div className="gro-crew-immigration-toolbar">
          <div className="gro-pass-segments" role="tablist" aria-label="Batch">
            {safeBatches.map((b, i) => (
              <button
                key={b.batch || i}
                type="button"
                role="tab"
                aria-selected={i === activeBatchIndex}
                className={`gro-pass-segment${i === activeBatchIndex ? " gro-pass-segment--active" : ""}`}
                onClick={() => setActiveBatchIndex(i)}
              >
                {b.batch}
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
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6}>No crew found.</td>
              </tr>
            ) : (
              pageRows.map((row) => (
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
          {`Showing ${pageStartDisplay}-${pageEndDisplay} of ${totalRows}`}
        </p>
        <div className="gro-crew-immigration-pagination-controls">
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {pageNumbers.map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={`gro-crew-immigration-page-btn${pageNo === currentPage ? " gro-crew-immigration-page-btn--active" : ""}`}
              onClick={() => setPage(pageNo)}
            >
              {pageNo}
            </button>
          ))}
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

CrewImmigrationPanel.propTypes = {
  batches: PropTypes.arrayOf(
    PropTypes.shape({
      batch: PropTypes.string,
      rows: PropTypes.arrayOf(PropTypes.object),
    })
  ),
  loading: PropTypes.bool,
};

import PropTypes from "prop-types";

const MaterialTablePagination = ({ page, total, limit, onPageChange }) => {
  const safePage = Number(page) || 1;
  const safeLimit = Math.max(Number(limit) || 1, 1);
  const safeTotal = Math.max(Number(total) || 0, 0);
  const totalPages = Math.max(Math.ceil(safeTotal / safeLimit), 1);
  const currentPage = Math.min(Math.max(safePage, 1), totalPages);
  const startItem = safeTotal === 0 ? 0 : (currentPage - 1) * safeLimit + 1;
  const endItem = Math.min(currentPage * safeLimit, safeTotal);

  const handlePageChange = (nextPage) => {
    const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);

    if (clampedPage !== currentPage) {
      onPageChange(clampedPage);
    }
  };

  if (safeTotal <= safeLimit) {
    return null;
  }

  return (
    <div
      className="material-table-pagination"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        fontSize: "14px",
      }}
    >
      <span style={{ color: "#666" }}>
        Showing {startItem}-{endItem} of {safeTotal}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            border: "1px solid #d0d5dd",
            borderRadius: "4px",
            background: currentPage <= 1 ? "#f5f5f5" : "#fff",
            color: currentPage <= 1 ? "#98a2b3" : "#344054",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            padding: "6px 10px",
          }}
        >
          Previous
        </button>
        <span style={{ color: "#344054", minWidth: "84px", textAlign: "center" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            border: "1px solid #d0d5dd",
            borderRadius: "4px",
            background: currentPage >= totalPages ? "#f5f5f5" : "#fff",
            color: currentPage >= totalPages ? "#98a2b3" : "#344054",
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            padding: "6px 10px",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

MaterialTablePagination.propTypes = {
  page: PropTypes.number,
  total: PropTypes.number,
  limit: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};

MaterialTablePagination.defaultProps = {
  page: 1,
  total: 0,
  limit: 10,
};

export default MaterialTablePagination;

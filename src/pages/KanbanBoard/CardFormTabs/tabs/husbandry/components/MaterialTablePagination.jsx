import PropTypes from "prop-types";

const MaterialTablePagination = ({ page, total, limit, onPageChange }) => {
  if (!total || total <= 0) return null;

  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px 4px", fontSize: "13px", color: "#555" }}>
      <span>Showing {start} to {end} of {total} entries</span>
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{ padding: "4px 10px", border: "1px solid #dee2e6", borderRadius: "4px", background: page === 1 ? "#f8f9fa" : "#fff", color: page === 1 ? "#aaa" : "#00368c", cursor: page === 1 ? "default" : "pointer" }}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{ padding: "4px 10px", border: "1px solid #dee2e6", borderRadius: "4px", background: page === p ? "#00368c" : "#fff", color: page === p ? "#fff" : "#00368c", cursor: "pointer", fontWeight: page === p ? 600 : 400 }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{ padding: "4px 10px", border: "1px solid #dee2e6", borderRadius: "4px", background: page === totalPages ? "#f8f9fa" : "#fff", color: page === totalPages ? "#aaa" : "#00368c", cursor: page === totalPages ? "default" : "pointer" }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

MaterialTablePagination.propTypes = {
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default MaterialTablePagination;

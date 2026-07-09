import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PremiumCardHeader, CrewCell, WorkOrderChip, RouteCell } from "./Husbandry.components";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_LIST = [];

const parseRequestedDate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    const normalized = value.replace(" ", "T");
    const parsed = parseISO(normalized);
    if (isValid(parsed)) return parsed;
  }
  const d = new Date(value);
  return isValid(d) ? d : null;
};

const formatRequestedDate = (value) => {
  const parsed = parseRequestedDate(value);
  if (!parsed) {
    return <span className="crew-pass-requests-table__empty-cell">—</span>;
  }
  return format(parsed, "dd/MM/yyyy");
};

const statusToneClass = (status) => {
  const raw = String(status ?? "").trim().toLowerCase();
  if (raw === "pending") return "crew-pass-requests-table__badge--pending";
  if (raw === "documents pending" || (raw.includes("document") && raw.includes("pending"))) {
    return "crew-pass-requests-table__badge--docs-pending";
  }
  if (raw === "completed" || raw === "done") return "crew-pass-requests-table__badge--done";
  return "crew-pass-requests-table__badge--default";
};

const pickDocumentUrl = (row) =>
  row?.document_url ?? row?.documentUrl ?? row?.document_URL ?? "";

const CellText = ({ value }) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return <span className="crew-pass-requests-table__empty-cell">—</span>;
  }
  return value;
};

CellText.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const renderCell = (column, row, rowIndex) => {
  if (column.render) return column.render(row);
  if (column.type === "route") {
    return <RouteCell from={column.fromAccessor?.(row)} to={column.toAccessor?.(row)} />;
  }
  const value = column.accessor ? column.accessor(row) : row?.[column.key];
  if (column.type === "workorder") return <WorkOrderChip value={value} />;
  if (column.type === "crew") return <CrewCell name={value} index={rowIndex} />;
  if (column.type === "status") {
    const rawStatus = value;
    const statusEmpty =
      rawStatus === undefined || rawStatus === null || String(rawStatus).trim() === "";
    if (statusEmpty) {
      return <span className="crew-pass-requests-table__empty-cell">—</span>;
    }
    return (
      <span className={`crew-pass-requests-table__badge ${statusToneClass(rawStatus)}`}>
        {rawStatus}
      </span>
    );
  }
  if (column.type === "date") return formatRequestedDate(value);
  if (column.type === "document") {
    const docUrl = pickDocumentUrl(row);
    if (!docUrl) {
      return <span className="crew-pass-requests-table__empty-cell">—</span>;
    }
    return (
      <button
        type="button"
        className="crew-pass-requests-table__doc-btn"
        onClick={() => window.open(docUrl, "_blank", "noopener,noreferrer")}
        aria-label="View document"
      >
        <FiEye size={15} />
      </button>
    );
  }
  return <CellText value={value} />;
};

const HusbandryServiceRequestsTable = ({
  title,
  subtitle,
  icon,
  requests,
  loading,
  columns,
  emptyMessage,
  serviceType,
  pageSize,
  accent,
}) => {
  const safeList = useMemo(
    () => (Array.isArray(requests) ? requests : EMPTY_LIST),
    [requests]
  );
  const count = safeList.length;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(count / pageSize) || 1);

  const listSignature = useMemo(
    () =>
      `${count}|${safeList
        .map((r, i) =>
          String(r?.id ?? r?.request_id ?? r?.wo_number ?? `row-${i}`)
        )
        .join(",")}`,
    [safeList, count]
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [listSignature]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return safeList.slice(start, start + pageSize);
  }, [safeList, page, pageSize]);

  const rangeStart = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = count === 0 ? 0 : Math.min(page * pageSize, count);

  return (
    <div
      className={`crew-pass-requests-table-card husb-accent-${accent}`}
      data-service-type={serviceType}
      role="region"
      aria-label={title}
    >
      <PremiumCardHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        count={loading ? "…" : count}
        headerClassName="crew-pass-requests-table-card__header"
        titleClassName="crew-pass-requests-table-card__title"
      />

      <div className="crew-pass-requests-table-card__body">
        {loading ? (
          <div className="crew-pass-requests-table-card__skeleton" aria-busy="true">
            <Skeleton height={14} borderRadius={6} count={1} style={{ marginBottom: 12 }} />
            <Skeleton height={36} borderRadius={6} count={6} />
          </div>
        ) : count === 0 ? (
          <div className="crew-pass-requests-table-card__empty">{emptyMessage}</div>
        ) : (
          <>
            <div className="crew-pass-requests-table-scroll crew-pass-thin-scrollbar">
              <table className="crew-pass-requests-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((row, idx) => {
                    const rowKey =
                      row?.id ??
                      row?.request_id ??
                      `${row?.wo_number ?? "row"}-${(page - 1) * pageSize + idx}`;
                    return (
                      <tr key={rowKey}>
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={
                              col.type === "document"
                                ? "crew-pass-requests-table__doc-cell"
                                : undefined
                            }
                          >
                            {renderCell(col, row, (page - 1) * pageSize + idx)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="crew-pass-requests-table-card__pagination crew-pass-requests-pagination">
              <span className="crew-pass-requests-pagination__info">
                Showing {rangeStart}-{rangeEnd} of {count}
              </span>
              <div className="crew-pass-requests-pagination__actions">
                <button
                  type="button"
                  className="crew-pass-requests-pagination__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className="crew-pass-requests-pagination__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

HusbandryServiceRequestsTable.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  requests: PropTypes.array,
  loading: PropTypes.bool,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      accessor: PropTypes.func,
      fromAccessor: PropTypes.func,
      toAccessor: PropTypes.func,
      type: PropTypes.oneOf(["status", "date", "document", "workorder", "crew", "route"]),
      render: PropTypes.func,
    })
  ).isRequired,
  emptyMessage: PropTypes.string,
  serviceType: PropTypes.string,
  pageSize: PropTypes.number,
  accent: PropTypes.oneOf(["blue", "teal", "purple", "amber", "rose", "slate", "green", "pink"]),
};


HusbandryServiceRequestsTable.defaultProps = {
  icon: "list",
  requests: [],
  loading: false,
  emptyMessage: "No requests found",
  serviceType: "",
  pageSize: DEFAULT_PAGE_SIZE,
  accent: "blue",
};

export default HusbandryServiceRequestsTable;

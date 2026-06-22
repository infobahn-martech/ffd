import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { flattenPassRequestRows } from "../../../../../../../services/cgAndZwailpassService";

const DEFAULT_PAGE_SIZE = 5;
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

const CrewPassRequestsTable = ({
  title,
  requests,
  loading,
  passType,
  pageSize,
  emptyMessage = "No pass requests found",
}) => {
  const safeList = useMemo(() => {
    const source = Array.isArray(requests) ? requests : EMPTY_LIST;
    return flattenPassRequestRows(source);
  }, [requests]);
  const count = safeList.length;

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(count / pageSize) || 1);

  const listSignature = useMemo(
    () =>
      `${count}|${safeList
        .map((r, i) =>
          String(r?.id ?? r?.crew_pass_id ?? r?.request_id ?? r?.wo_number ?? `row-${i}`)
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

  const openDocument = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="crew-pass-requests-table-card"
      data-pass-type={passType}
      role="region"
      aria-label={title}
    >
      <div className="crew-pass-requests-table-card__header">
        <h3 className="crew-pass-requests-table-card__title">{title}</h3>
        <span className="crew-pass-requests-table-card__count" aria-live="polite">
          {loading ? "…" : count}
        </span>
      </div>

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
                    <th>Wo No</th>
                    <th>Crew Name</th>
                    <th>Passport No</th>
                    <th>SignOn/SignOff</th>
                    <th>Status</th>
                    <th>Gro</th>
                    <th>Requested Date</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((row, idx) => {
                    const docUrl = pickDocumentUrl(row);
                    const rowKey =
                      row?.id ??
                      row?.crew_pass_id ??
                      row?.request_id ??
                      `${row?.wo_number ?? "row"}-${(page - 1) * pageSize + idx}`;
                    const rawStatus = row?.status;
                    const statusEmpty =
                      rawStatus === undefined || rawStatus === null || String(rawStatus).trim() === "";
                    return (
                      <tr key={rowKey}>
                        <td>
                          <CellText value={row?.wo_number} />
                        </td>
                        <td>
                          <CellText value={row?.crew_name} />
                        </td>
                        <td>
                          <CellText value={row?.passport_no} />
                        </td>
                        <td>
                          <CellText value={row?.movement_type} />
                        </td>
                        <td>
                          {statusEmpty ? (
                            <span className="crew-pass-requests-table__empty-cell">—</span>
                          ) : (
                            <span className={`crew-pass-requests-table__badge ${statusToneClass(rawStatus)}`}>
                              {rawStatus}
                            </span>
                          )}
                        </td>
                        <td>
                          <CellText value={row?.assigned_gro_name} />
                        </td>
                        <td>{formatRequestedDate(row?.requested_date)}</td>
                        <td className="crew-pass-requests-table__doc-cell">
                          {docUrl ? (
                            <button
                              type="button"
                              className="crew-pass-requests-table__doc-btn"
                              onClick={() => openDocument(docUrl)}
                              aria-label="View document"
                            >
                              <FiEye size={15} />
                            </button>
                          ) : (
                            <span className="crew-pass-requests-table__empty-cell">—</span>
                          )}
                        </td>
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

CrewPassRequestsTable.propTypes = {
  title: PropTypes.string.isRequired,
  requests: PropTypes.array,
  loading: PropTypes.bool,
  passType: PropTypes.string,
  pageSize: PropTypes.number,
  emptyMessage: PropTypes.string,
};

CrewPassRequestsTable.defaultProps = {
  requests: [],
  loading: false,
  passType: "",
  pageSize: DEFAULT_PAGE_SIZE,
  emptyMessage: "No pass requests found",
};

export default CrewPassRequestsTable;

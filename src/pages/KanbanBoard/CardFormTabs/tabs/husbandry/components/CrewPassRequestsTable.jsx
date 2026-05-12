import PropTypes from "prop-types";
import { format, isValid, parseISO } from "date-fns";
import { FiEye } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const formatRequestedDate = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return format(parsed, "dd/MM/yyyy");
  }
  const d = new Date(value);
  if (isValid(d)) return format(d, "dd/MM/yyyy");
  return String(value);
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

const CrewPassRequestsTable = ({ title, requests, loading, passType }) => {
  const safeList = Array.isArray(requests) ? requests : [];
  const count = safeList.length;

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
          <div className="crew-pass-requests-table-card__empty">No pass requests found</div>
        ) : (
          <div className="crew-pass-requests-table-scroll">
            <table className="crew-pass-requests-table">
              <thead>
                <tr>
                  <th>WO No</th>
                  <th>Crew Name</th>
                  <th>Passport No</th>
                  <th>Movement</th>
                  <th>Status</th>
                  <th>GRO</th>
                  <th>Requested Date</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {safeList.map((row, idx) => {
                  const docUrl = pickDocumentUrl(row);
                  const rowKey =
                    row?.id ?? row?.request_id ?? `${row?.wo_number ?? "row"}-${idx}`;
                  return (
                    <tr key={rowKey}>
                      <td>{row?.wo_number ?? "—"}</td>
                      <td>{row?.crew_name ?? "—"}</td>
                      <td>{row?.passport_no ?? "—"}</td>
                      <td>{row?.movement_type ?? "—"}</td>
                      <td>
                        <span className={`crew-pass-requests-table__badge ${statusToneClass(row?.status)}`}>
                          {row?.status ?? "—"}
                        </span>
                      </td>
                      <td>{row?.assigned_gro_name ?? "—"}</td>
                      <td>{formatRequestedDate(row?.requested_date)}</td>
                      <td className="crew-pass-requests-table__doc-cell">
                        {docUrl ? (
                          <button
                            type="button"
                            className="crew-pass-requests-table__doc-btn"
                            onClick={() => openDocument(docUrl)}
                            aria-label="View document"
                          >
                            <FiEye size={18} />
                          </button>
                        ) : (
                          <span className="crew-pass-requests-table__dash">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
};

CrewPassRequestsTable.defaultProps = {
  requests: [],
  loading: false,
  passType: "",
};

export default CrewPassRequestsTable;

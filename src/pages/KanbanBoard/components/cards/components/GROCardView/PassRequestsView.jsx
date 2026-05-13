import PropTypes from "prop-types";
import {
  firstNonEmptyGroDisplay,
  groPassCrewRowFields,
  groPassStatusBadgeTone,
  groPassTaskDocLabel,
  groPassTaskDocUrl,
} from "./groCardUtils";

/**
 * CG / Zawil pass requests table — loading / error / empty, expandable WO task_documents.
 */
const PassRequestsView = ({
  workOrders,
  loading,
  errorMessage,
  onRetry,
  expandedWoIds,
  onToggleWoExpand,
}) => {
  const hasWorkOrders = Array.isArray(workOrders) && workOrders.length > 0;
  let crewRowCount = 0;
  if (hasWorkOrders) {
    for (const wo of workOrders) {
      const crew = Array.isArray(wo?.crew) ? wo.crew : [];
      crewRowCount += crew.length > 0 ? crew.length : 1;
    }
  }

  if (loading) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state">Loading pass requests…</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state gro-pass-table-state--error">
          <span>{errorMessage}</span>
          {onRetry ? (
            <button type="button" className="gro-pass-retry-btn" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!hasWorkOrders || crewRowCount === 0) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state gro-pass-table-state--empty">No pass requests for this call.</div>
      </div>
    );
  }

  return (
    <div className="gro-pass-table-panel">
      <div className="gro-pass-table-scroll">
        <table className="gro-pass-table">
          <thead>
            <tr>
              <th>WO Number</th>
              <th>Crew Name</th>
              <th>Passport No</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Movement Type</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Remarks</th>
              <th>Document</th>
            </tr>
          </thead>
          {workOrders.map((wo, woIdx) => {
            const woKey = String(wo?.wo_id ?? wo?.id ?? wo?.wo_number ?? `idx-${woIdx}`);
            const woNumber = firstNonEmptyGroDisplay(wo?.wo_number, wo?.woNumber, wo?.work_order_number);
            const crew = Array.isArray(wo?.crew) ? wo.crew : [];
            const taskDocs = Array.isArray(wo?.task_documents) ? wo.task_documents : [];
            const expanded = expandedWoIds.has(String(woKey));

            return (
              <tbody key={`${woKey}-${woIdx}`} className="gro-pass-table-wo-group">
                {crew.length === 0 ? (
                  <tr>
                    <td>{woNumber}</td>
                    <td colSpan={9} className="gro-pass-table-muted">
                      No crew listed for this work order.
                    </td>
                  </tr>
                ) : (
                  crew.map((c, idx) => {
                    const f = groPassCrewRowFields(c);
                    const tone = groPassStatusBadgeTone(f.status);
                    return (
                      <tr key={`${woKey}-c-${idx}`}>
                        {idx === 0 ? <td rowSpan={crew.length} className="gro-pass-wo-cell">{woNumber}</td> : null}
                        <td>{f.crewName}</td>
                        <td>{f.passport}</td>
                        <td>{f.nationality}</td>
                        <td>{f.rank}</td>
                        <td>{f.movementType}</td>
                        <td>
                          <span className={`gro-pass-status-badge gro-pass-status-badge--${tone}`}>{f.status}</span>
                        </td>
                        <td>{f.requestedDate}</td>
                        <td className="gro-pass-remarks-cell" title={f.remarks}>
                          {f.remarks}
                        </td>
                        <td>
                          {f.documentUrl ? (
                            <button
                              type="button"
                              className="gro-pass-doc-link-btn"
                              onClick={() => window.open(f.documentUrl, "_blank", "noopener,noreferrer")}
                            >
                              Open
                            </button>
                          ) : (
                            <span className="gro-pass-table-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr className="gro-pass-taskdocs-row">
                  <td colSpan={10}>
                    <button
                      type="button"
                      className="gro-pass-taskdocs-toggle"
                      aria-expanded={expanded}
                      onClick={() => onToggleWoExpand(String(woKey))}
                    >
                      <span className="gro-pass-taskdocs-toggle-label">
                        Work order files{taskDocs.length ? ` (${taskDocs.length})` : ""}
                      </span>
                      <span className="gro-pass-taskdocs-chevron" aria-hidden>
                        {expanded ? "▾" : "▸"}
                      </span>
                    </button>
                    {expanded && taskDocs.length > 0 ? (
                      <ul className="gro-pass-taskdocs-list">
                        {taskDocs.map((td, i) => {
                          const url = groPassTaskDocUrl(td);
                          const label = groPassTaskDocLabel(td, i);
                          return (
                            <li key={`${woKey}-td-${i}`}>
                              {url && url !== "-" ? (
                                <button
                                  type="button"
                                  className="gro-pass-taskdoc-link"
                                  onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                                >
                                  {label}
                                </button>
                              ) : (
                                <span>{label}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                    {expanded && taskDocs.length === 0 ? (
                      <div className="gro-pass-taskdocs-empty">No task documents for this work order.</div>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
};

PassRequestsView.propTypes = {
  workOrders: PropTypes.array,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onRetry: PropTypes.func,
  expandedWoIds: PropTypes.instanceOf(Set).isRequired,
  onToggleWoExpand: PropTypes.func.isRequired,
};

export default PassRequestsView;

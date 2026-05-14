import PropTypes from "prop-types";
import { FiInbox, FiUpload } from "react-icons/fi";
import { firstNonEmptyGroDisplay, groPassCrewRowFields, groPassStatusBadgeTone } from "./groCardUtils";

/**
 * CG / Zawil pass requests table — loading / error / empty; one row per crew line item.
 */
const PassRequestsView = ({ workOrders, loading, errorMessage, onRetry, onPassRowUpload }) => {
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
        <div className="gro-pass-table-state gro-pass-table-state--loading">Loading pass requests…</div>
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
        <div className="gro-pass-table-state gro-pass-table-state--empty">
          <span className="gro-pass-empty-icon" aria-hidden>
            <FiInbox />
          </span>
          <p className="gro-pass-empty-title">No pass requests yet</p>
          <p className="gro-pass-empty-subtitle">When crew pass lines are submitted for this call, they will appear here.</p>
        </div>
      </div>
    );
  }

  const flatRows = [];
  workOrders.forEach((wo, woIdx) => {
    const woKey = String(wo?.wo_id ?? wo?.id ?? wo?.wo_number ?? `idx-${woIdx}`);
    const woNumber = firstNonEmptyGroDisplay(wo?.wo_number, wo?.woNumber, wo?.work_order_number);
    const crew = Array.isArray(wo?.crew) ? wo.crew : [];
    if (crew.length === 0) {
      flatRows.push({ kind: "empty-wo", woKey, woIdx, wo, woNumber });
      return;
    }
    crew.forEach((c, idx) => {
      flatRows.push({
        kind: "crew",
        woKey,
        woIdx,
        wo,
        woNumber,
        crew: c,
        crewIndex: idx,
        isFirstInWo: idx === 0,
        woCrewCount: crew.length,
      });
    });
  });

  return (
    <div className="gro-pass-table-panel">
      <div className="gro-pass-table-scroll">
        <table className="gro-pass-table">
          <thead>
            <tr>
              <th>Wo number</th>
              <th>Crew name</th>
              <th>Passport no</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Movement type</th>
              <th>Status</th>
              <th>Requested date</th>
              <th>Remarks</th>
              <th className="gro-pass-table-th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {flatRows.map((row) => {
              if (row.kind === "empty-wo") {
                return (
                  <tr key={`${row.woKey}-empty`}>
                    <td className="gro-pass-wo-cell">{row.woNumber}</td>
                    <td colSpan={9} className="gro-pass-table-muted">
                      No crew listed for this work order.
                    </td>
                  </tr>
                );
              }
              const f = groPassCrewRowFields(row.crew);
              const tone = groPassStatusBadgeTone(f.status);
              const rowPayload = {
                workOrder: row.wo,
                crew: row.crew,
                crewIndex: row.crewIndex,
                woNumber: row.woNumber,
                woKey: row.woKey,
                fields: f,
              };
              return (
                <tr key={`${row.woKey}-c-${row.crewIndex}`}>
                  {row.isFirstInWo ? (
                    <td rowSpan={row.woCrewCount} className="gro-pass-wo-cell">
                      {row.woNumber}
                    </td>
                  ) : null}
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
                  <td className="gro-pass-action-cell">
                    <button
                      type="button"
                      className="gro-pass-upload-btn"
                      onClick={() => onPassRowUpload?.(rowPayload)}
                      aria-label={`Upload for ${f.crewName || "pass row"}`}
                    >
                      <FiUpload className="gro-pass-upload-btn-icon" aria-hidden />
                      Upload
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
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
  onPassRowUpload: PropTypes.func,
};

export default PassRequestsView;

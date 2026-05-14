import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FiChevronLeft, FiChevronRight, FiInbox, FiUpload, FiX } from "react-icons/fi";
import {
  firstNonEmptyGroDisplay,
  getGroCrewPassId,
  getGroWorkOrderId,
  groPassCrewRowFields,
  groPassStatusBadgeTone,
} from "./groCardUtils";

const PAGE_SIZE = 10;

const initialUploadForm = () => ({
  passNo: "",
  issueDate: "",
  file: null,
});

/**
 * CG / Zawil pass requests table — loading / error / empty; one row per crew line item.
 */
const PassRequestsView = ({ workOrders, loading, errorMessage, onRetry, passVariant, onPassUploadSubmit }) => {
  const hasWorkOrders = Array.isArray(workOrders) && workOrders.length > 0;
  let crewRowCount = 0;
  if (hasWorkOrders) {
    for (const wo of workOrders) {
      const crew = Array.isArray(wo?.crew) ? wo.crew : [];
      crewRowCount += crew.length > 0 ? crew.length : 1;
    }
  }

  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("single");
  const [singleContext, setSingleContext] = useState(null);
  const [bulkWoId, setBulkWoId] = useState("");
  const [form, setForm] = useState(initialUploadForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [passVariant]);

  const flatRows = useMemo(() => {
    const rows = [];
    if (!hasWorkOrders) return rows;
    workOrders.forEach((wo, woIdx) => {
      const woKey = String(wo?.wo_id ?? wo?.id ?? wo?.wo_number ?? `idx-${woIdx}`);
      const woNumber = firstNonEmptyGroDisplay(wo?.wo_number, wo?.woNumber, wo?.work_order_number);
      const woId = getGroWorkOrderId(wo);
      const crew = Array.isArray(wo?.crew) ? wo.crew : [];
      if (crew.length === 0) {
        rows.push({ kind: "empty-wo", woKey, woIdx, wo, woNumber, woId });
        return;
      }
      crew.forEach((c, idx) => {
        rows.push({
          kind: "crew",
          woKey,
          woIdx,
          wo,
          woNumber,
          woId,
          crew: c,
          crewIndex: idx,
          crewPassId: getGroCrewPassId(c),
        });
      });
    });
    return rows;
  }, [hasWorkOrders, workOrders]);

  const bulkEligibleOrders = useMemo(() => {
    if (!hasWorkOrders) return [];
    return workOrders
      .map((wo) => {
        const crew = Array.isArray(wo?.crew) ? wo.crew : [];
        const woId = getGroWorkOrderId(wo);
        if (crew.length === 0 || woId == null) return null;
        const woNumber = firstNonEmptyGroDisplay(wo?.wo_number, wo?.woNumber, wo?.work_order_number);
        return { wo, woId: String(woId), label: woNumber !== "-" ? woNumber : `Work order ${woId}` };
      })
      .filter(Boolean);
  }, [hasWorkOrders, workOrders]);

  const totalPages = Math.max(1, Math.ceil(flatRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedRows = flatRows.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetUploadUi = useCallback(() => {
    setForm(initialUploadForm());
    setFieldErrors({});
    setSingleContext(null);
    setBulkWoId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const closeModal = useCallback(() => {
    setUploadOpen(false);
    resetUploadUi();
    setSubmitting(false);
  }, [resetUploadUi]);

  useEffect(() => {
    if (!uploadOpen) return;
    closeModal();
  }, [passVariant]); // eslint-disable-line react-hooks/exhaustive-deps -- tab switch closes modal

  const openSingleUpload = (rowPayload) => {
    resetUploadUi();
    setUploadMode("single");
    setSingleContext(rowPayload);
    setUploadOpen(true);
  };

  const openBulkUpload = () => {
    resetUploadUi();
    setUploadMode("bulk");
    const first = bulkEligibleOrders[0];
    setBulkWoId(first ? first.woId : "");
    setUploadOpen(true);
  };

  const validateUploadForm = () => {
    const next = {};
    if (!String(form.passNo ?? "").trim()) next.passNo = "Pass no is required.";
    if (!String(form.issueDate ?? "").trim()) next.issueDate = "Issue date is required.";
    if (!form.file) next.file = "Document copy is required.";
    if (uploadMode === "bulk" && !String(bulkWoId ?? "").trim()) {
      next.bulkWo = "Select a work order.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildFormData = () => {
    const fd = new FormData();
    const passNo = String(form.passNo ?? "").trim();
    const issueDate = String(form.issueDate ?? "").trim();
    fd.append("pass_no", passNo);
    fd.append("issue_date", issueDate);
    fd.append("document_copy", form.file);

    if (uploadMode === "single") {
      if (passVariant === "cg") {
        const woId = singleContext?.woId ?? getGroWorkOrderId(singleContext?.workOrder);
        fd.append("wo_id", String(woId));
      } else {
        const cpId = singleContext?.crewPassId ?? getGroCrewPassId(singleContext?.crew);
        fd.append("crew_pass_id", String(cpId));
      }
    } else {
      fd.append("wo_id", String(bulkWoId));
    }
    return fd;
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!onPassUploadSubmit || typeof onPassUploadSubmit !== "function") return;
    if (!validateUploadForm()) return;
    setSubmitting(true);
    try {
      const fd = buildFormData();
      await onPassUploadSubmit(fd);
      closeModal();
      setPage(1);
    } catch {
      /* parent shows error toast */
    } finally {
      setSubmitting(false);
    }
  };

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

  const canBulk = bulkEligibleOrders.length > 0 && typeof onPassUploadSubmit === "function";

  return (
    <div className="gro-pass-table-panel">
      <div className="gro-pass-table-toolbar">
        <div className="gro-pass-table-toolbar-spacer" aria-hidden />
        {canBulk ? (
          <button type="button" className="gro-pass-bulk-upload-btn" onClick={openBulkUpload}>
            Bulk upload
          </button>
        ) : null}
      </div>

      <div className="gro-pass-table-scroll">
        <table className="gro-pass-table">
          <thead>
            <tr>
              <th>Crew name</th>
              <th>Passport no</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>SignOn/SignOff</th>
              <th>Status</th>
              <th>Requested date</th>
              <th>Remarks</th>
              <th className="gro-pass-table-th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => {
              if (row.kind === "empty-wo") {
                return (
                  <tr key={`${row.woKey}-empty`}>
                    <td colSpan={9} className="gro-pass-table-muted">
                      No crew listed for this work order.
                    </td>
                  </tr>
                );
              }
              const f = groPassCrewRowFields(row.crew);
              const tone = groPassStatusBadgeTone(f.status);
              const woId = row.woId ?? getGroWorkOrderId(row.wo);
              const crewPassId = row.crewPassId ?? getGroCrewPassId(row.crew);
              const rowDisabledReason =
                passVariant === "cg"
                  ? woId == null
                    ? "Missing work order id."
                    : null
                  : crewPassId == null
                    ? "Missing crew pass id."
                    : null;
              const rowPayload = {
                workOrder: row.wo,
                crew: row.crew,
                crewIndex: row.crewIndex,
                woNumber: row.woNumber,
                woKey: row.woKey,
                woId,
                crewPassId,
                fields: f,
              };
              return (
                <tr key={`${row.woKey}-c-${row.crewIndex}`}>
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
                      disabled={Boolean(rowDisabledReason) || !onPassUploadSubmit}
                      title={rowDisabledReason ?? undefined}
                      onClick={() => openSingleUpload(rowPayload)}
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

      <div className="gro-pass-table-footer" aria-label="Table pagination">
        <div className="gro-pass-pagination">
          <span className="gro-pass-pagination__info">
            Page {safePage} of {totalPages}
          </span>
          <div className="gro-pass-pagination__nav">
            <button
              type="button"
              className="gro-pass-page-btn"
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="gro-pass-page-btn"
              aria-label="Next page"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {uploadOpen
        ? createPortal(
            <div
              className="gro-pass-upload-modal-backdrop"
              role="presentation"
              onMouseDown={(e) => e.target === e.currentTarget && !submitting && closeModal()}
            >
              <div
                className="gro-pass-upload-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gro-pass-upload-title"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="gro-pass-upload-modal__header">
                  <h4 id="gro-pass-upload-title" className="gro-pass-upload-modal__title">
                    {uploadMode === "bulk" ? "Bulk upload pass" : "Upload pass"}
                  </h4>
                  <button type="button" className="gro-pass-upload-modal__close" aria-label="Close" disabled={submitting} onClick={closeModal}>
                    <FiX aria-hidden />
                  </button>
                </div>
                <form className="gro-pass-upload-modal__form" onSubmit={handleSubmitUpload}>
                  <div className="gro-pass-upload-modal__body">
                    {uploadMode === "bulk" && bulkEligibleOrders.length > 1 ? (
                      <label className="gro-pass-upload-field">
                        <span className="gro-pass-upload-field__label">Work order</span>
                        <select
                          className="gro-pass-upload-field__control"
                          value={bulkWoId}
                          disabled={submitting}
                          onChange={(e) => setBulkWoId(e.target.value)}
                        >
                          {bulkEligibleOrders.map((o) => (
                            <option key={o.woId} value={o.woId}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.bulkWo ? <span className="gro-pass-field-error">{fieldErrors.bulkWo}</span> : null}
                      </label>
                    ) : null}

                    <label className="gro-pass-upload-field">
                      <span className="gro-pass-upload-field__label">Pass no</span>
                      <input
                        type="text"
                        className="gro-pass-upload-field__control"
                        value={form.passNo}
                        disabled={submitting}
                        onChange={(e) => setForm((prev) => ({ ...prev, passNo: e.target.value }))}
                        autoComplete="off"
                      />
                      {fieldErrors.passNo ? <span className="gro-pass-field-error">{fieldErrors.passNo}</span> : null}
                    </label>

                    <label className="gro-pass-upload-field">
                      <span className="gro-pass-upload-field__label">Issue date</span>
                      <input
                        type="date"
                        className="gro-pass-upload-field__control"
                        value={form.issueDate}
                        disabled={submitting}
                        onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                      />
                      {fieldErrors.issueDate ? <span className="gro-pass-field-error">{fieldErrors.issueDate}</span> : null}
                    </label>

                    <div className="gro-pass-upload-field">
                      <span className="gro-pass-upload-field__label">Document copy</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="gro-pass-upload-field__file"
                        disabled={submitting}
                        onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                      />
                      {fieldErrors.file ? <span className="gro-pass-field-error">{fieldErrors.file}</span> : null}
                    </div>
                  </div>
                  <div className="gro-pass-upload-modal__footer">
                    <button
                      type="button"
                      className="gro-pass-upload-modal__btn gro-pass-upload-modal__btn--secondary"
                      disabled={submitting}
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="gro-pass-upload-modal__btn gro-pass-upload-modal__btn--primary" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

PassRequestsView.propTypes = {
  workOrders: PropTypes.array,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onRetry: PropTypes.func,
  passVariant: PropTypes.oneOf(["cg", "zawil"]).isRequired,
  onPassUploadSubmit: PropTypes.func,
};

export default PassRequestsView;

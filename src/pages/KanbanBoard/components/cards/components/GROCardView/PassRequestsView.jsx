import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiInbox, FiUpload } from "react-icons/fi";
import GroPassUploadPopoverForm from "./GroPassUploadPopoverForm";
import {
  buildGroPassIssueDateString,
  computeGroPassUploadPopoverPosition,
  firstNonEmptyGroDisplay,
  flattenGroPassRows,
  getGroCrewPassId,
  getGroWorkOrderId,
  groPassCrewRowFields,
  groPassCrewRowId,
  groPassStatusBadgeTone,
  groPassUploadTargetId,
} from "./groCardUtils";

const PAGE_SIZE = 10;

/** Preserve flattenGroPassRows order; one entry per work order with crew row objects unchanged. */
const groupGroPassFlatRowsByWorkOrder = (flatRows) => {
  const groups = [];
  if (!Array.isArray(flatRows)) return groups;
  for (let i = 0; i < flatRows.length; i += 1) {
    const r = flatRows[i];
    if (r.kind === "empty-wo") {
      groups.push({
        woKey: r.woKey,
        woIdx: r.woIdx,
        wo: r.wo,
        woNumber: r.woNumber,
        woId: r.woId,
        crewRows: [],
      });
      continue;
    }
    if (r.kind !== "crew") continue;
    const crewRows = [];
    const { woKey } = r;
    let j = i;
    while (j < flatRows.length && flatRows[j].kind === "crew" && flatRows[j].woKey === woKey) {
      crewRows.push(flatRows[j]);
      j += 1;
    }
    groups.push({
      woKey,
      woIdx: r.woIdx,
      wo: r.wo,
      woNumber: r.woNumber,
      woId: r.woId,
      crewRows,
    });
    i = j - 1;
  }
  return groups;
};

const initialUploadForm = () => ({
  passNo: "",
  issuePickerParts: { date: "", time: "" },
  file: null,
});

/**
 * CG / Zawil pass requests — work orders as expandable groups; crew rows unchanged for selection / upload.
 */
const PassRequestsView = ({
  workOrders,
  loading,
  errorMessage,
  onRetry,
  passVariant,
  onPassUploadSubmit,
  selectedRowIds,
  onRowSelectionToggle,
  onVisiblePageSelectionChange,
}) => {
  const hasWorkOrders = Array.isArray(workOrders) && workOrders.length > 0;
  let crewRowCount = 0;
  if (hasWorkOrders) {
    for (const wo of workOrders) {
      const crew = Array.isArray(wo?.crew) ? wo.crew : [];
      crewRowCount += crew.length > 0 ? crew.length : 1;
    }
  }

  const [page, setPage] = useState(1);
  const [uploadMode, setUploadMode] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [singlePopoverRect, setSinglePopoverRect] = useState(null);
  const [form, setForm] = useState(initialUploadForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formLevelError, setFormLevelError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  /** Work orders in this set are collapsed; omitted keys are expanded. */
  const [collapsedWoKeys, setCollapsedWoKeys] = useState(() => new Set());
  const fileInputRef = useRef(null);
  const headerCheckboxRef = useRef(null);
  const singleUploadTriggerRef = useRef(null);
  const singlePopoverPortalRef = useRef(null);

  useEffect(() => {
    setPage(1);
    setUploadMode(null);
    setUploadTarget(null);
    setSinglePopoverRect(null);
    singleUploadTriggerRef.current = null;
    setForm(initialUploadForm());
    setFieldErrors({});
    setFormLevelError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCollapsedWoKeys(new Set());
  }, [passVariant]);

  const flatRows = useMemo(() => flattenGroPassRows(workOrders), [workOrders]);
  const woGroups = useMemo(() => groupGroPassFlatRowsByWorkOrder(flatRows), [flatRows]);

  const totalPages = Math.max(1, Math.ceil(woGroups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageGroups = woGroups.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visibleSelectableIds = useMemo(
    () => pageGroups.flatMap((g) => g.crewRows.map((r) => groPassCrewRowId(r))),
    [pageGroups]
  );

  const toggleWoKey = useCallback((woKey) => {
    setCollapsedWoKeys((prev) => {
      const next = new Set(prev);
      if (next.has(woKey)) next.delete(woKey);
      else next.add(woKey);
      return next;
    });
  }, []);

  const headerChecked =
    visibleSelectableIds.length > 0 && visibleSelectableIds.every((id) => selectedRowIds.has(id));

  useEffect(() => {
    const el = headerCheckboxRef.current;
    if (!el) return;
    const n = visibleSelectableIds.length;
    const sel = visibleSelectableIds.filter((id) => selectedRowIds.has(id)).length;
    el.indeterminate = n > 0 && sel > 0 && sel < n;
  }, [selectedRowIds, visibleSelectableIds]);

  const syncSinglePopoverRect = useCallback(() => {
    if (singleUploadTriggerRef.current) {
      setSinglePopoverRect(singleUploadTriggerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (uploadMode !== "single" || !uploadTarget) return undefined;
    syncSinglePopoverRect();
    const bump = () => syncSinglePopoverRect();
    window.addEventListener("scroll", bump, true);
    window.addEventListener("resize", bump);
    return () => {
      window.removeEventListener("scroll", bump, true);
      window.removeEventListener("resize", bump);
    };
  }, [uploadMode, uploadTarget, page, syncSinglePopoverRect]);

  const resetUploadForm = useCallback(() => {
    setForm(initialUploadForm());
    setFieldErrors({});
    setFormLevelError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const hideSinglePassUpload = useCallback(() => {
    setUploadMode(null);
    setUploadTarget(null);
    setSinglePopoverRect(null);
    singleUploadTriggerRef.current = null;
    resetUploadForm();
    setSubmitting(false);
  }, [resetUploadForm]);

  const validateUploadForm = () => {
    const next = {};
    if (!String(form.passNo ?? "").trim()) next.passNo = "Pass no is required.";
    const issueDate = buildGroPassIssueDateString(form.issuePickerParts);
    if (!String(issueDate ?? "").trim()) next.issueDate = "Issue date and time is required.";
    if (!form.file) next.file = "Document copy is required.";
    setFieldErrors(next);
    const ok = Object.keys(next).length === 0;
    if (!ok) {
      const parts = [next.passNo, next.issueDate, next.file].filter(Boolean);
      setFormLevelError(parts.join(" "));
    } else {
      setFormLevelError("");
    }
    return ok;
  };

  const appendCommonFields = (fd) => {
    fd.append("pass_no", String(form.passNo ?? "").trim());
    fd.append("issue_date", buildGroPassIssueDateString(form.issuePickerParts));
    fd.append("document_copy", form.file);
  };

  const openSingleUpload = (rowPayload, e) => {
    resetUploadForm();
    const btn = e?.currentTarget;
    if (btn && btn instanceof Element) {
      singleUploadTriggerRef.current = btn;
      setSinglePopoverRect(btn.getBoundingClientRect());
    }
    setUploadMode("single");
    setUploadTarget(rowPayload);
  };

  const onHeaderCheckboxChange = (e) => {
    onVisiblePageSelectionChange(visibleSelectableIds, e.target.checked);
  };

  const handleCancelUpload = () => {
    hideSinglePassUpload();
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!onPassUploadSubmit || typeof onPassUploadSubmit !== "function") return;
    if (!validateUploadForm()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      appendCommonFields(fd);
      const cpId = uploadTarget?.crewPassId ?? getGroCrewPassId(uploadTarget?.crew);
      fd.append("crew_pass_id", String(cpId));
      await onPassUploadSubmit(fd);
      hideSinglePassUpload();
      setPage(1);
    } catch {
      /* parent shows error toast */
    } finally {
      setSubmitting(false);
    }
  };

  const singleTitle = passVariant === "cg" ? "Upload CG Pass" : "Upload Zawil Pass";

  const singlePopoverStyle =
    uploadMode === "single" && uploadTarget && singlePopoverRect != null
      ? computeGroPassUploadPopoverPosition(singlePopoverRect)
      : null;

  const singlePortal =
    uploadMode === "single" &&
    uploadTarget &&
    singlePopoverStyle &&
    typeof document !== "undefined" &&
    document.body
      ? createPortal(
          <div
            ref={singlePopoverPortalRef}
            className="gro-pass-upload-popover"
            style={singlePopoverStyle}
            role="presentation"
          >
            <GroPassUploadPopoverForm
              title={singleTitle}
              passNo={form.passNo}
              onPassNoChange={(e) => setForm((prev) => ({ ...prev, passNo: e.target.value }))}
              issuePickerParts={form.issuePickerParts}
              onIssueDateTimeChange={({ date, time }) =>
                setForm((prev) => ({
                  ...prev,
                  issuePickerParts: {
                    date: date || "",
                    time: time != null && time !== "" ? String(time).slice(0, 5) : "",
                  },
                }))
              }
              fileInputRef={fileInputRef}
              fileName={form.file?.name}
              onFileInputChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
              onCancel={handleCancelUpload}
              onSubmit={handleSubmitUpload}
              submitting={submitting}
              formLevelError={formLevelError}
              hasIssueDateError={Boolean(fieldErrors.issueDate)}
              datetimePopperClassName="gro-pass-upload-datetime-popper"
            />
          </div>,
          document.body
        )
      : null;

  if (loading) {
    return (
      <>
        <div className="gro-pass-table-panel">
          <div className="gro-pass-table-state gro-pass-table-state--loading">Loading pass requests…</div>
        </div>
        {singlePortal}
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
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
        {singlePortal}
      </>
    );
  }

  if (!hasWorkOrders || crewRowCount === 0) {
    return (
      <>
        <div className="gro-pass-table-panel">
          <div className="gro-pass-table-state gro-pass-table-state--empty">
            <span className="gro-pass-empty-icon" aria-hidden>
              <FiInbox />
            </span>
            <p className="gro-pass-empty-title">No pass requests yet</p>
            <p className="gro-pass-empty-subtitle">When crew pass lines are submitted for this call, they will appear here.</p>
          </div>
        </div>
        {singlePortal}
      </>
    );
  }

  return (
    <>
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-scroll">
          <table className="gro-pass-table">
            <thead>
              <tr>
                <th className="gro-pass-table-th-check">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    className="gro-pass-row-check"
                    checked={headerChecked}
                    aria-label="Select all rows on this page"
                    disabled={visibleSelectableIds.length === 0}
                    onChange={onHeaderCheckboxChange}
                  />
                </th>
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
              {pageGroups.map((g) => {
                const isWoExpanded = !collapsedWoKeys.has(g.woKey);
                const wo = g.wo;
                const woLabel = firstNonEmptyGroDisplay(
                  g.woNumber,
                  wo?.wo_number,
                  wo?.woNumber,
                  wo?.work_order_number,
                  g.woKey
                );
                const crewCount = g.crewRows.length;

                const onWoKeyDown = (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleWoKey(g.woKey);
                  }
                };

                return (
                  <Fragment key={g.woKey}>
                    <tr
                      className="gro-pass-wo-header-row"
                      tabIndex={0}
                      role="button"
                      aria-expanded={isWoExpanded}
                      aria-label={`Work order ${woLabel}. ${isWoExpanded ? "Expanded" : "Collapsed"}. Press Enter or Space to toggle.`}
                      onKeyDown={onWoKeyDown}
                      onClick={() => toggleWoKey(g.woKey)}
                    >
                      <td colSpan={10} className="gro-pass-wo-header-cell">
                        <div className="gro-pass-wo-header-inner">
                          <FiChevronDown
                            className={`gro-pass-wo-chevron${isWoExpanded ? " gro-pass-wo-chevron--expanded" : ""}`}
                            aria-hidden
                          />
                          <span className="gro-pass-wo-number">{woLabel}</span>
                        </div>
                      </td>
                    </tr>
                    {isWoExpanded && crewCount === 0 ? (
                      <tr className="gro-pass-wo-empty-crew-row">
                        <td className="gro-pass-table-td-check gro-pass-table-td-check--empty" aria-hidden />
                        <td colSpan={9} className="gro-pass-table-muted gro-pass-crew-subindent">
                          No crew found for this work order.
                        </td>
                      </tr>
                    ) : null}
                    {isWoExpanded
                      ? g.crewRows.map((row) => {
                          const f = groPassCrewRowFields(row.crew);
                          const tone = groPassStatusBadgeTone(f.status);
                          const woId = row.woId ?? getGroWorkOrderId(row.wo);
                          const crewPassId = row.crewPassId ?? getGroCrewPassId(row.crew);
                          const rowDisabledReason =
                            crewPassId == null ? "Missing crew pass id." : null;
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
                          const rid = groPassCrewRowId(row);
                          const checked = selectedRowIds.has(rid);
                          const isRowActive =
                            uploadMode === "single" &&
                            uploadTarget &&
                            groPassUploadTargetId(uploadTarget) === groPassUploadTargetId(rowPayload);

                          return (
                            <tr key={rid} className="gro-pass-crew-subrow">
                              <td className="gro-pass-table-td-check">
                                <input
                                  type="checkbox"
                                  className="gro-pass-row-check"
                                  checked={checked}
                                  aria-label={`Select row ${f.crewName || rid}`}
                                  onChange={() => onRowSelectionToggle(rid)}
                                />
                              </td>
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
                                  className={`gro-pass-upload-btn${isRowActive ? " gro-pass-upload-btn--popover-open" : ""}`}
                                  disabled={Boolean(rowDisabledReason) || !onPassUploadSubmit}
                                  title={rowDisabledReason ?? undefined}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isRowActive) {
                                      hideSinglePassUpload();
                                      return;
                                    }
                                    openSingleUpload(rowPayload, e);
                                  }}
                                  aria-label={`Upload for ${f.crewName || "pass row"}`}
                                >
                                  <FiUpload className="gro-pass-upload-btn-icon" aria-hidden />
                                  Upload
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </Fragment>
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
      </div>
      {singlePortal}
    </>
  );
};

PassRequestsView.propTypes = {
  workOrders: PropTypes.array,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onRetry: PropTypes.func,
  passVariant: PropTypes.oneOf(["cg", "zawil"]).isRequired,
  onPassUploadSubmit: PropTypes.func,
  selectedRowIds: PropTypes.instanceOf(Set).isRequired,
  onRowSelectionToggle: PropTypes.func.isRequired,
  onVisiblePageSelectionChange: PropTypes.func.isRequired,
};

export default PassRequestsView;

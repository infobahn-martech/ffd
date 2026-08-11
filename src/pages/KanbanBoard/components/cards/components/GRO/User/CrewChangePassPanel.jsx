import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FiUpload } from "react-icons/fi";
import { notify } from "../../../../../../../components/Toaster";
import crewService from "../../../../../../../services/crewService";
import groService from "../../../../../../../services/groService";
import { getPassRequests, extractPassRequestsFromEnvelope } from "../../../../../../../services/cgAndZwailpassService";
import { groApiErrorMessage } from "./groCardUtils";
import { crewChangeRowFields, getCrewChangeCrewId, normalizeCrewChangeListResponse } from "./crewChangePassUtils";
import CrewChangeCgPassGenerateView from "./CrewChangeCgPassGenerateView";
import CrewPassRequestsTable from "../../../../../CardFormTabs/Import/tabs/husbandry/components/CrewPassRequestsTable";

const PAGE_SIZE = 10;

/** Crew Change stage: crew roster + CG Pass (templated or AI-read) / Zawil Pass (AI-read) upload flows. */
export default function CrewChangePassPanel({ callId, portId }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [selectedCrewIds, setSelectedCrewIds] = useState(() => new Set());
  const [view, setView] = useState("roster");
  const [activeTab, setActiveTab] = useState("crewChange");
  const [passRequests, setPassRequests] = useState({ cg: [], zawil: [] });
  const [passRequestsLoading, setPassRequestsLoading] = useState(false);

  const [showZawilBulkModal, setShowZawilBulkModal] = useState(false);
  const [zawilBulkFile, setZawilBulkFile] = useState(null);
  const [zawilBulkSubmitting, setZawilBulkSubmitting] = useState(false);
  const zawilBulkFileInputRef = useRef(null);

  // CG Pass single-row upload — no popover, just pick a file and it uploads immediately (AI-read).
  const [cgSingleUploadCrewId, setCgSingleUploadCrewId] = useState(null);
  const cgSingleUploadCrewRef = useRef(null);
  const cgSingleFileInputRef = useRef(null);

  // Zawil Pass single-row upload — no popover, just pick a file and it uploads immediately.
  const [zawilSingleUploadCrewId, setZawilSingleUploadCrewId] = useState(null);
  const zawilSingleUploadCrewRef = useRef(null);
  const zawilSingleFileInputRef = useRef(null);

  const fetchCrewList = useCallback(
    (page) => {
      if (callId == null || callId === "") return;
      setLoading(true);
      crewService
        .getCrewList({ call_id: callId, page, limit: PAGE_SIZE })
        .then((res) => {
          const { rows: nextRows, pagination: nextPagination } = normalizeCrewChangeListResponse(res);
          setRows(nextRows);
          setPagination(nextPagination);
        })
        .catch(() => {
          setRows([]);
        })
        .finally(() => setLoading(false));
    },
    [callId]
  );

  useEffect(() => {
    fetchCrewList(1);
  }, [fetchCrewList]);

  const fetchPassRequests = useCallback(() => {
    if (callId == null || callId === "") {
      setPassRequests({ cg: [], zawil: [] });
      return;
    }
    setPassRequestsLoading(true);
    getPassRequests(callId)
      .then((res) => setPassRequests(extractPassRequestsFromEnvelope(res)))
      .catch(() => setPassRequests({ cg: [], zawil: [] }))
      .finally(() => setPassRequestsLoading(false));
  }, [callId]);

  useEffect(() => {
    fetchPassRequests();
  }, [fetchPassRequests]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const pageStartDisplay = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEndDisplay = Math.min(pagination.page * pagination.limit, pagination.total);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchCrewList(page);
  };

  const toggleRowSelection = (crewId) => {
    setSelectedCrewIds((prev) => {
      const next = new Set(prev);
      if (next.has(crewId)) next.delete(crewId);
      else next.add(crewId);
      return next;
    });
  };

  const headerChecked = rows.length > 0 && rows.every((row) => selectedCrewIds.has(getCrewChangeCrewId(row)));

  const toggleHeaderSelection = (checked) => {
    setSelectedCrewIds((prev) => {
      const next = new Set(prev);
      rows.forEach((row) => {
        const id = getCrewChangeCrewId(row);
        if (id == null) return;
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const selectedRows = rows.filter((row) => selectedCrewIds.has(getCrewChangeCrewId(row)));

  // CG Pass single-row upload — no popover, just pick a file and it uploads immediately (AI-read).
  const triggerCgSingleUpload = (crew) => {
    cgSingleUploadCrewRef.current = crew;
    if (cgSingleFileInputRef.current) cgSingleFileInputRef.current.value = "";
    cgSingleFileInputRef.current?.click();
  };

  const handleCgSingleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const crew = cgSingleUploadCrewRef.current;
    if (!file || !crew) return;
    const crewId = getCrewChangeCrewId(crew);
    setCgSingleUploadCrewId(crewId);
    try {
      const formData = new FormData();
      formData.append("cg_document[]", file);
      formData.append("crew_id", String(crewId));
      await groService.uploadCgPassAi(formData);
      notify("CG Pass uploaded successfully.", "success");
      fetchCrewList(pagination.page);
    } catch (err) {
      notify(groApiErrorMessage(err, "Upload failed."), "error");
    } finally {
      setCgSingleUploadCrewId(null);
      cgSingleUploadCrewRef.current = null;
    }
  };

  // Zawil Pass single-row upload — no popover, just pick a file and it uploads immediately.
  const triggerZawilSingleUpload = (crew) => {
    zawilSingleUploadCrewRef.current = crew;
    if (zawilSingleFileInputRef.current) zawilSingleFileInputRef.current.value = "";
    zawilSingleFileInputRef.current?.click();
  };

  const handleZawilSingleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const crew = zawilSingleUploadCrewRef.current;
    if (!file || !crew) return;
    const crewId = getCrewChangeCrewId(crew);
    setZawilSingleUploadCrewId(crewId);
    try {
      const formData = new FormData();
      formData.append("zawil_document[]", file);
      formData.append("crew_id", String(crewId));
      await groService.uploadZawilPassAi(formData);
      notify("Zawil Pass uploaded successfully.", "success");
      fetchCrewList(pagination.page);
    } catch (err) {
      notify(groApiErrorMessage(err, "Upload failed."), "error");
    } finally {
      setZawilSingleUploadCrewId(null);
      zawilSingleUploadCrewRef.current = null;
    }
  };

  const resetZawilBulkForm = () => {
    setZawilBulkFile(null);
    if (zawilBulkFileInputRef.current) zawilBulkFileInputRef.current.value = "";
  };

  const handleZawilBulkSubmit = async () => {
    if (selectedRows.length === 0) {
      notify("Select at least one crew member first.", "warn");
      return;
    }
    if (!zawilBulkFile) {
      notify("Please select a file to upload.", "warn");
      return;
    }

    setZawilBulkSubmitting(true);
    try {
      await Promise.all(
        selectedRows.map((row) => {
          const formData = new FormData();
          formData.append("zawil_document[]", zawilBulkFile);
          formData.append("crew_id", String(getCrewChangeCrewId(row)));
          return groService.uploadZawilPassAi(formData);
        })
      );
      notify("Zawil Pass uploaded successfully.", "success");
      setShowZawilBulkModal(false);
      resetZawilBulkForm();
      fetchCrewList(pagination.page);
    } catch (err) {
      notify(groApiErrorMessage(err, "Upload failed."), "error");
    } finally {
      setZawilBulkSubmitting(false);
    }
  };

  const handleGenerateUploaded = () => {
    setView("roster");
    setSelectedCrewIds(new Set());
    fetchCrewList(pagination.page);
  };

  if (view === "generate") {
    return (
      <CrewChangeCgPassGenerateView
        portId={portId}
        selectedRows={selectedRows}
        onBack={() => setView("roster")}
        onUploaded={handleGenerateUploaded}
      />
    );
  }

  return (
    <div className="gro-crew-immigration-panel">
      <div className="gro-crew-immigration-toolbar gro-crew-change-toolbar">
        <div className="gro-pass-segments" role="tablist" aria-label="Crew change view">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "crewChange"}
            className={`gro-pass-segment${activeTab === "crewChange" ? " gro-pass-segment--active" : ""}`}
            onClick={() => setActiveTab("crewChange")}
          >
            Crew Change
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cg"}
            className={`gro-pass-segment${activeTab === "cg" ? " gro-pass-segment--active" : ""}`}
            onClick={() => setActiveTab("cg")}
          >
            CG Pass
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "zawil"}
            className={`gro-pass-segment${activeTab === "zawil" ? " gro-pass-segment--active" : ""}`}
            onClick={() => setActiveTab("zawil")}
          >
            Zawil Pass
          </button>
        </div>
        {activeTab === "crewChange" && (
          <div className="gro-crew-change-toolbar-actions">
            <button
              type="button"
              className="gro-pass-segment gro-crew-change-action-btn"
              disabled={selectedCrewIds.size === 0}
              onClick={() => setView("generate")}
            >
              Generate CG Pass
            </button>
            <button
              type="button"
              className="gro-pass-segment gro-crew-change-action-btn"
              onClick={() => setShowZawilBulkModal(true)}
            >
              Bulk Upload Zawil Pass
            </button>
          </div>
        )}
      </div>

      {activeTab !== "crewChange" && (
        <CrewPassRequestsTable
          title={activeTab === "cg" ? "CG Pass requests" : "Zawil Pass requests"}
          subtitle={
            activeTab === "cg" ? "All CG pass bookings for this call" : "All Zawil pass bookings for this call"
          }
          requests={activeTab === "cg" ? passRequests.cg : passRequests.zawil}
          loading={passRequestsLoading}
          passType={activeTab === "cg" ? "CG" : "Zawil"}
          accent={activeTab === "cg" ? "blue" : "amber"}
        />
      )}

      {activeTab === "crewChange" && (
      <div className="gro-crew-immigration-table-wrap">
        <table className="gro-crew-immigration-table">
          <thead>
            <tr>
              <th className="gro-pass-table-th-check">
                <input
                  type="checkbox"
                  className="gro-pass-row-check"
                  checked={headerChecked}
                  disabled={rows.length === 0}
                  aria-label="Select all rows on this page"
                  onChange={(e) => toggleHeaderSelection(e.target.checked)}
                />
              </th>
              <th>Crew Name</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Movement Type</th>
              <th>Passport</th>
              <th>Iqama</th>
              <th>Visa</th>
              <th>CG Pass</th>
              <th>Zawil Pass</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10}>No crew found.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const f = crewChangeRowFields(row);
                const checked = selectedCrewIds.has(f.crewId);
                return (
                  <tr key={f.crewId}>
                    <td className="gro-pass-table-td-check">
                      <input
                        type="checkbox"
                        className="gro-pass-row-check"
                        checked={checked}
                        aria-label={`Select ${f.crewName}`}
                        onChange={() => toggleRowSelection(f.crewId)}
                      />
                    </td>
                    <td>{f.crewName}</td>
                    <td>{f.nationality}</td>
                    <td>{f.rank}</td>
                    <td>{f.movementType}</td>
                    <td>{f.passport}</td>
                    <td>{f.iqama}</td>
                    <td>{f.visa}</td>
                    <td>
                      <button
                        type="button"
                        className="gro-crew-change-row-upload-btn"
                        title={`Upload CG Pass for ${f.crewName}`}
                        aria-label={`Upload CG Pass for ${f.crewName}`}
                        disabled={cgSingleUploadCrewId === f.crewId}
                        onClick={() => triggerCgSingleUpload(row)}
                      >
                        {cgSingleUploadCrewId === f.crewId ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        ) : (
                          <FiUpload />
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gro-crew-change-row-upload-btn"
                        title={`Upload Zawil Pass for ${f.crewName}`}
                        aria-label={`Upload Zawil Pass for ${f.crewName}`}
                        disabled={zawilSingleUploadCrewId === f.crewId}
                        onClick={() => triggerZawilSingleUpload(row)}
                      >
                        {zawilSingleUploadCrewId === f.crewId ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        ) : (
                          <FiUpload />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      {activeTab === "crewChange" && (
      <div className="gro-crew-immigration-pagination">
        <p className="gro-crew-immigration-pagination-text">
          {`Showing ${pageStartDisplay}-${pageEndDisplay} of ${pagination.total}`}
        </p>
        <div className="gro-crew-immigration-pagination-controls">
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={`gro-crew-immigration-page-btn${pageNo === pagination.page ? " gro-crew-immigration-page-btn--active" : ""}`}
              onClick={() => goToPage(pageNo)}
            >
              {pageNo}
            </button>
          ))}
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      )}

      <input
        ref={cgSingleFileInputRef}
        type="file"
        className="gro-premium-upload-input-hidden"
        onChange={handleCgSingleFileChange}
      />

      <input
        ref={zawilSingleFileInputRef}
        type="file"
        className="gro-premium-upload-input-hidden"
        onChange={handleZawilSingleFileChange}
      />

      {showZawilBulkModal && typeof document !== "undefined" && document.body
        ? createPortal(
            <div
              className="gro-stage-upload-modal-overlay"
              role="presentation"
              onClick={() => {
                if (zawilBulkSubmitting) return;
                setShowZawilBulkModal(false);
                resetZawilBulkForm();
              }}
            >
              <div
                className="gro-stage-upload-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Bulk Upload Zawil Pass"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="gro-inward-popover-header">Bulk Upload Zawil Pass</div>
                <div className="gro-inward-popover-body">
                  <button
                    type="button"
                    className={`gro-stage-upload-dropzone${zawilBulkFile ? " gro-stage-upload-dropzone--has-file" : ""}`}
                    disabled={zawilBulkSubmitting}
                    onClick={() => zawilBulkFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (zawilBulkSubmitting) return;
                      const file = e.dataTransfer?.files?.[0];
                      if (file) setZawilBulkFile(file);
                    }}
                  >
                    <span className="gro-stage-upload-dropzone-text">Click to select a file</span>
                    <span className="gro-stage-upload-filename" title={zawilBulkFile?.name || ""}>
                      {zawilBulkFile?.name || ""}
                    </span>
                  </button>
                  <input
                    ref={zawilBulkFileInputRef}
                    type="file"
                    className="gro-premium-upload-input-hidden"
                    disabled={zawilBulkSubmitting}
                    onChange={(e) => setZawilBulkFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="gro-stage-upload-actions gro-inward-popover-footer">
                  <button
                    type="button"
                    className="gro-inward-popover-btn-cancel"
                    disabled={zawilBulkSubmitting}
                    onClick={() => {
                      setShowZawilBulkModal(false);
                      resetZawilBulkForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="gro-inward-popover-btn-submit"
                    disabled={zawilBulkSubmitting}
                    onClick={handleZawilBulkSubmit}
                  >
                    {zawilBulkSubmitting ? "Uploading…" : "Upload Zawil Pass"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

CrewChangePassPanel.propTypes = {
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

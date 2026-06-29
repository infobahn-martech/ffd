import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiUploadCloud, FiFileText, FiCheckCircle } from "react-icons/fi";
import BulkPassUploadView from "./BulkPassUploadView";
import CustomModal from "../../../../../../../components/CustomModal";

const ZAWIL_UPLOAD_MODAL_CLASS =
  "modal change-pass fade employee-modal logout-modal gro-zawil-upload-modal";

function buildBulkRowsFromSelection(rows, selectedRowIds) {
  return rows
    .filter((row) => selectedRowIds.has(String(row.id)))
    .map((row) => ({
      id: row.id,
      crewName: row.crewName ?? "",
      nationality: row.nationality ?? "",
      passportIqama: [row.passport, row.iqama].filter(Boolean).join(" / "),
      zawilNo: "",
    }));
}

function CrewImmigrationPassIcon({ passData, uploadLabel, viewLabel, onUpload, onView }) {
  const isUploaded = Boolean(passData);
  return (
    <button
      type="button"
      className={`gro-crew-immigration-icon-action${isUploaded ? " gro-crew-immigration-icon-action--uploaded" : ""}`}
      title={isUploaded ? viewLabel : uploadLabel}
      onClick={() => (isUploaded ? onView() : onUpload())}
    >
      {isUploaded ? (
        <span className="gro-crew-immigration-uploaded-icon-wrap">
          <FiFileText className="gro-crew-immigration-uploaded-file-icon" />
          <FiCheckCircle className="gro-crew-immigration-uploaded-check-icon" />
        </span>
      ) : (
        <FiUploadCloud className="gro-crew-immigration-pending-icon" />
      )}
    </button>
  );
}

CrewImmigrationPassIcon.propTypes = {
  passData: PropTypes.any,
  uploadLabel: PropTypes.string.isRequired,
  viewLabel: PropTypes.string.isRequired,
  onUpload: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default function CrewImmigrationPanel({
  passType,
  onPassTypeChange,
  passLoading,
  portId,
  selectedRowIds,
  onBulkUploadCg,
  onBulkUploadZawil,
  headerCheckboxRef,
  isAllSelected,
  onSelectAllChange,
  rows,
  onRowSelectionChange,
  pageStartDisplay,
  pageEndDisplay,
  totalRows,
  currentPage,
  totalPages,
  pageNumbers,
  onPrevPage,
  onPageChange,
  onNextPage,
  cgFileInputRef,
  zawilFileInputRef,
  onCgFileChange,
  onZawilFileChange,
  onRowUploadClick,
}) {
  const [bulkUploadMode, setBulkUploadMode] = useState(null); // "cg" | null
  const [bulkRows, setBulkRows] = useState([]);
  const [zawilModalOpen, setZawilModalOpen] = useState(false);
  const [zawilModalFile, setZawilModalFile] = useState(null);
  const [zawilModalSubmitting, setZawilModalSubmitting] = useState(false);
  const zawilModalFileInputRef = useRef(null);

  const enterBulkUploadMode = (mode) => {
    setBulkRows(buildBulkRowsFromSelection(rows, selectedRowIds));
    setBulkUploadMode(mode);
  };

  const exitBulkUploadMode = () => {
    setBulkUploadMode(null);
    setBulkRows([]);
  };

  const handleBulkSubmit = () => {
    if (bulkUploadMode === "cg") {
      onBulkUploadCg();
    }
    exitBulkUploadMode();
  };

  const openZawilModal = () => {
    setZawilModalFile(null);
    if (zawilModalFileInputRef.current) zawilModalFileInputRef.current.value = "";
    setZawilModalOpen(true);
  };

  const closeZawilModal = () => {
    if (zawilModalSubmitting) return;
    setZawilModalOpen(false);
    setZawilModalFile(null);
    if (zawilModalFileInputRef.current) zawilModalFileInputRef.current.value = "";
  };

  const handleZawilModalSubmit = async () => {
    if (!zawilModalFile || zawilModalSubmitting) return;
    setZawilModalSubmitting(true);
    try {
      await Promise.resolve(onZawilFileChange({ target: { files: [zawilModalFile] } }));
      setZawilModalOpen(false);
      setZawilModalFile(null);
      if (zawilModalFileInputRef.current) zawilModalFileInputRef.current.value = "";
    } finally {
      setZawilModalSubmitting(false);
    }
  };

  if (bulkUploadMode) {
    return (
      <div className="gro-crew-immigration-panel">
        <BulkPassUploadView
          passType={bulkUploadMode}
          rows={bulkRows}
          onRowsChange={setBulkRows}
          onBack={exitBulkUploadMode}
          onSubmit={handleBulkSubmit}
          portId={portId}
        />
      </div>
    );
  }

  return (
    <div className="gro-crew-immigration-panel">
      <div className="gro-crew-immigration-toolbar">
        <div className="gro-pass-segments" role="tablist" aria-label="Pass type">
          <button
            type="button"
            role="tab"
            aria-selected={passType === "cg"}
            className={`gro-pass-segment${passType === "cg" ? " gro-pass-segment--active" : ""}`}
            onClick={() => onPassTypeChange("cg")}
            disabled={passLoading}
          >
            CG Pass
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={passType === "zawil"}
            className={`gro-pass-segment${passType === "zawil" ? " gro-pass-segment--active" : ""}`}
            onClick={() => onPassTypeChange("zawil")}
            disabled={passLoading}
          >
            Zawil Pass
          </button>
        </div>
        <button
          type="button"
          className="gro-crew-immigration-bulk-btn"
          onClick={() => enterBulkUploadMode("cg")}
          disabled={selectedRowIds.size === 0}
        >
          Generate CG Pass
        </button>
        <button
          type="button"
          className="gro-crew-immigration-bulk-btn"
          onClick={openZawilModal}
        >
          Bulk Upload Zawil Pass
        </button>
      </div>
      <div className="gro-crew-immigration-table-wrap">
        <table className="gro-crew-immigration-table">
          <thead>
            <tr>
              <th className="gro-crew-immigration-th-checkbox">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="gro-crew-immigration-checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAllChange(e.target.checked)}
                />
              </th>
              <th>Crew Name</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Movement Type</th>
              <th>Passport</th>
              <th>Iqama</th>
              <th>Visa</th>
              <th className="gro-crew-immigration-th-cg-pass">CG Pass</th>
              <th className="gro-crew-immigration-th-zawil-pass">Zawil Pass</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = String(row.id);
              const isSelected = selectedRowIds.has(rowId);
              return (
                <tr key={rowId}>
                  <td className="gro-crew-immigration-td-checkbox">
                    <input
                      type="checkbox"
                      className="gro-crew-immigration-checkbox"
                      checked={isSelected}
                      onChange={(e) => onRowSelectionChange(rowId, e.target.checked)}
                    />
                  </td>
                  <td>{row.crewName}</td>
                  <td>{row.nationality}</td>
                  <td>{row.rank}</td>
                  <td>{row.movementType}</td>
                  <td>{row.passport}</td>
                  <td>{row.iqama}</td>
                  <td>{row.visa}</td>
                  <td className="gro-crew-immigration-cg-pass-cell">
                    <CrewImmigrationPassIcon
                      passData={row.cgPass}
                      uploadLabel="Upload CG Pass"
                      viewLabel="View Uploaded CG Pass"
                      onUpload={() => onRowUploadClick("cg", rowId)}
                      onView={() => {
                        if (row.cgPass?.fileUrl) {
                          window.open(row.cgPass.fileUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    />
                  </td>
                  <td className="gro-crew-immigration-zawil-pass-cell">
                    <CrewImmigrationPassIcon
                      passData={row.zawilPass}
                      uploadLabel="Upload Zawil Pass"
                      viewLabel="View Uploaded Zawil Pass"
                      onUpload={() => onRowUploadClick("zawil", rowId)}
                      onView={() => {
                        if (row.zawilPass?.fileUrl) {
                          window.open(row.zawilPass.fileUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="gro-crew-immigration-pagination">
        <p className="gro-crew-immigration-pagination-text">
          {`Showing ${pageStartDisplay}-${pageEndDisplay} of ${totalRows}`}
        </p>
        <div className="gro-crew-immigration-pagination-controls">
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {pageNumbers.map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={`gro-crew-immigration-page-btn${pageNo === currentPage ? " gro-crew-immigration-page-btn--active" : ""}`}
              onClick={() => onPageChange(pageNo)}
            >
              {pageNo}
            </button>
          ))}
          <button
            type="button"
            className="gro-crew-immigration-page-btn"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <input
        ref={cgFileInputRef}
        type="file"
        className="gro-crew-immigration-file-input"
        onChange={onCgFileChange}
      />
      <input
        ref={zawilFileInputRef}
        type="file"
        className="gro-crew-immigration-file-input"
        onChange={onZawilFileChange}
      />
      <CustomModal
        createModal
        className={ZAWIL_UPLOAD_MODAL_CLASS}
        show={zawilModalOpen}
        closeModal={closeZawilModal}
        body={
          <div className="modal-body">
            <div className="popup-title gro-zawil-upload-modal__title">Bulk Upload Zawil Pass</div>
            <div className="gro-zawil-upload-modal__body">
              <button
                type="button"
                className="gro-zawil-upload-modal__dropzone"
                onClick={() => zawilModalFileInputRef.current?.click()}
                disabled={zawilModalSubmitting}
              >
                <FiUploadCloud className="gro-zawil-upload-modal__dropzone-icon" />
                <span className="gro-zawil-upload-modal__dropzone-text">
                  {zawilModalFile ? zawilModalFile.name : "Click to select a file"}
                </span>
              </button>
              <input
                ref={zawilModalFileInputRef}
                type="file"
                className="gro-crew-immigration-file-input"
                onChange={(e) => setZawilModalFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="two-btn logout-btn gro-zawil-upload-modal__footer">
              <button
                type="button"
                className="btn-common close"
                onClick={closeZawilModal}
                disabled={zawilModalSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save btn-common gro-zawil-upload-modal__submit"
                disabled={!zawilModalFile || zawilModalSubmitting}
                onClick={handleZawilModalSubmit}
              >
                {zawilModalSubmitting ? (
                  <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </span>
                ) : (
                  "Upload Zawil Pass"
                )}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}

CrewImmigrationPanel.propTypes = {
  passType: PropTypes.oneOf(["cg", "zawil"]).isRequired,
  onPassTypeChange: PropTypes.func.isRequired,
  passLoading: PropTypes.bool,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedRowIds: PropTypes.instanceOf(Set).isRequired,
  onBulkUploadCg: PropTypes.func.isRequired,
  onBulkUploadZawil: PropTypes.func.isRequired,
  headerCheckboxRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  isAllSelected: PropTypes.bool.isRequired,
  onSelectAllChange: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowSelectionChange: PropTypes.func.isRequired,
  pageStartDisplay: PropTypes.number.isRequired,
  pageEndDisplay: PropTypes.number.isRequired,
  totalRows: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  cgFileInputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  zawilFileInputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  onCgFileChange: PropTypes.func.isRequired,
  onZawilFileChange: PropTypes.func.isRequired,
  onRowUploadClick: PropTypes.func.isRequired,
};

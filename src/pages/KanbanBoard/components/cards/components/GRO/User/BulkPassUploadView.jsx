import PropTypes from "prop-types";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";

const PASS_META = {
  cg: {
    title: "Bulk Upload CG Pass",
    docTitle: "Coast Guard Pass",
    docTitleArabic: "تصريح خفر السواحل",
    submitLabel: "Upload CG Pass",
  },
  zawil: {
    title: "Bulk Upload Zawil Pass",
    docTitle: "Zawil Pass",
    docTitleArabic: "تصريح زول",
    submitLabel: "Upload Zawil Pass",
  },
};

const EDITABLE_FIELDS = [
  { key: "crewName", label: "Crew Name" },
  { key: "nationality", label: "Nationality" },
  { key: "passportIqama", label: "Passport / Iqama No" },
  { key: "zawilNo", label: "Zawil No" },
];

function formatToday() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function BulkPassUploadView({ passType, rows, onRowsChange, onBack, onSubmit }) {
  const meta = PASS_META[passType] ?? PASS_META.cg;

  const handleFieldChange = (rowId, field, value) => {
    onRowsChange(
      rows.map((row) => (String(row.id) === String(rowId) ? { ...row, [field]: value } : row))
    );
  };

  return (
    <div className="gro-crew-immigration-bulk">
      <div className="gro-crew-immigration-bulk-header">
        <button type="button" className="gro-crew-immigration-bulk-back" onClick={onBack}>
          <FiArrowLeft className="gro-crew-immigration-bulk-back-icon" />
          Back
        </button>
        <h3 className="gro-crew-immigration-bulk-heading">{meta.title}</h3>
      </div>

      <div className="gro-crew-immigration-bulk-body">
        <div className="gro-crew-immigration-bulk-left">
          <p className="gro-crew-immigration-bulk-section-title">Crew Details</p>
          <div className="gro-crew-immigration-bulk-table-wrap">
            <table className="gro-crew-immigration-bulk-table">
              <thead>
                <tr>
                  <th className="gro-crew-immigration-bulk-th-sl">Sl No</th>
                  {EDITABLE_FIELDS.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={EDITABLE_FIELDS.length + 1} className="gro-crew-immigration-bulk-empty">
                      No crew selected.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={String(row.id)}>
                      <td className="gro-crew-immigration-bulk-td-sl">{index + 1}</td>
                      {EDITABLE_FIELDS.map((field) => (
                        <td key={field.key}>
                          <input
                            type="text"
                            className="gro-crew-immigration-bulk-input"
                            value={row[field.key] ?? ""}
                            onChange={(e) => handleFieldChange(row.id, field.key, e.target.value)}
                            placeholder={field.label}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gro-crew-immigration-bulk-right">
          <p className="gro-crew-immigration-bulk-section-title">Document Preview</p>
          <div
            className="gro-crew-immigration-bulk-preview"
            aria-readonly="true"
            aria-label="Document preview (read only)"
          >
            <div className="gro-crew-immigration-bulk-preview-page">
              <div className="gro-crew-immigration-bulk-preview-head">
                <div className="gro-crew-immigration-bulk-preview-titles">
                  <span className="gro-crew-immigration-bulk-preview-title-ar">{meta.docTitleArabic}</span>
                  <span className="gro-crew-immigration-bulk-preview-title-en">{meta.docTitle}</span>
                </div>
                <div className="gro-crew-immigration-bulk-preview-meta">
                  <span>Date: {formatToday()}</span>
                  <span>Vessel: ____________________</span>
                </div>
              </div>

              <div className="gro-crew-immigration-bulk-preview-arabic">
                <span className="gro-crew-immigration-bulk-preview-ar-line" />
                <span className="gro-crew-immigration-bulk-preview-ar-line" />
                <span className="gro-crew-immigration-bulk-preview-ar-line gro-crew-immigration-bulk-preview-ar-line--short" />
              </div>

              <table className="gro-crew-immigration-bulk-preview-table">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>Name</th>
                    <th>Nationality</th>
                    <th>Passport / Iqama No</th>
                    <th>Zawil No</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="gro-crew-immigration-bulk-preview-empty">
                        No crew selected.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={String(row.id)}>
                        <td>{index + 1}</td>
                        <td>{row.crewName || "—"}</td>
                        <td>{row.nationality || "—"}</td>
                        <td>{row.passportIqama || "—"}</td>
                        <td>{row.zawilNo || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="gro-crew-immigration-bulk-preview-footer">
                <span>Authorized Signature</span>
                <span>Official Stamp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gro-crew-immigration-bulk-actions">
        <button
          type="button"
          className="gro-crew-immigration-bulk-submit"
          onClick={onSubmit}
          disabled={rows.length === 0}
        >
          <FiUploadCloud className="gro-crew-immigration-bulk-submit-icon" />
          {meta.submitLabel}
        </button>
      </div>
    </div>
  );
}

BulkPassUploadView.propTypes = {
  passType: PropTypes.oneOf(["cg", "zawil"]).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowsChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

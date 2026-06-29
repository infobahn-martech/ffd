import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import VesselBoardingArabicPreview from "./VesselBoardingArabicPreview";
import groService from "../../../../../../../services/groService";

const PASS_META = {
  cg: {
    title: "Bulk Upload CG Pass",
    submitLabel: "Upload CG Pass",
    templateType: "CG Pass",
  },
  zawil: {
    title: "Bulk Upload Zawil Pass",
    submitLabel: "Upload Zawil Pass",
    templateType: "Vessel Registration",
  },
};

const EDITABLE_FIELDS = [
  { key: "crewName", label: "Crew Name" },
  { key: "nationality", label: "Nationality" },
  { key: "passportIqama", label: "Passport / Iqama No" },
  { key: "zawilNo", label: "Zawil No" },
];

export default function BulkPassUploadView({ passType, rows, onRowsChange, onBack, onSubmit, portId }) {
  const meta = PASS_META[passType] ?? PASS_META.cg;
  const [templateData, setTemplateData] = useState(null);

  useEffect(() => {
    if (!portId) return;
    let cancelled = false;
    groService
      .getTemplatesByPort(portId, meta.templateType)
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.data ?? res?.data ?? [];
        const first = Array.isArray(list) ? list[0] : null;
        setTemplateData(first ?? null);
      })
      .catch(() => {
        if (!cancelled) setTemplateData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [portId, meta.templateType]);

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
          <VesselBoardingArabicPreview rows={rows} templateData={templateData} />
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
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

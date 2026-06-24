import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import VesselBoardingArabicPreview from "./VesselBoardingArabicPreview";
import { GRO_STATIC_VESSEL_INWARD_CREW_ROWS } from "./groCardUtils";

const EDITABLE_FIELDS = [
  { key: "crewName", label: "Crew Name" },
  { key: "nationality", label: "Nationality" },
  { key: "passportIqama", label: "Passport / Iqama No" },
  { key: "zawilNo", label: "Zawil No" },
];

/** Vessel Inward Registration boarding view — crew details + Arabic document preview (static). */
const VesselInwardRegistrationView = forwardRef(function VesselInwardRegistrationView(
  { initialRows = GRO_STATIC_VESSEL_INWARD_CREW_ROWS },
  ref
) {
  const [rows, setRows] = useState(initialRows);
  const previewRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      getPreviewHtml: () => previewRef.current?.outerHTML,
    }),
    []
  );

  const handleFieldChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => (String(row.id) === String(rowId) ? { ...row, [field]: value } : row))
    );
  };

  return (
    <div className="gro-crew-immigration-panel">
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
                      No crew available.
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
          <div ref={previewRef}>
            <VesselBoardingArabicPreview rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
});

VesselInwardRegistrationView.propTypes = {
  initialRows: PropTypes.arrayOf(PropTypes.object),
};

VesselInwardRegistrationView.displayName = "VesselInwardRegistrationView";

export default VesselInwardRegistrationView;

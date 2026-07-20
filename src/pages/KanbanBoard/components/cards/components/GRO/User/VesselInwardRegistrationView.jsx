import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { FiSave } from "react-icons/fi";
import VesselBoardingArabicPreview from "./VesselBoardingArabicPreview";
import { extractVesselRegTemplateFields } from "./vesselRegTemplateFields";
import groService from "../../../../../../../services/groService";

/** Vessel Inward Registration boarding view — vessel particulars (from the port's pass template) + Arabic document preview. */
const VesselInwardRegistrationView = forwardRef(function VesselInwardRegistrationView(
  { onSave, isSaving = false, portId },
  ref
) {
  const [templateData, setTemplateData] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const previewRef = useRef(null);

  useEffect(() => {
    if (!portId) return;
    let cancelled = false;
    groService
      .getTemplatesByPort(portId, "Vessel Registration")
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
  }, [portId]);

  const vesselFields = useMemo(
    () => extractVesselRegTemplateFields(templateData?.more_description),
    [templateData]
  );

  useEffect(() => {
    setFieldValues({});
  }, [templateData]);

  useImperativeHandle(
    ref,
    () => ({
      getPreviewHtml: () => previewRef.current?.outerHTML,
    }),
    []
  );

  const handleFieldChange = (fieldKey, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  return (
    <div className="gro-crew-immigration-panel">
      <div className="gro-crew-immigration-bulk-body">
        <div className="gro-crew-immigration-bulk-left">
          <p className="gro-crew-immigration-bulk-section-title">Vessel Particulars</p>
          <div className="gro-crew-immigration-bulk-table-wrap">
            <table className="gro-crew-immigration-bulk-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {vesselFields.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="gro-crew-immigration-bulk-empty">
                      No fields available.
                    </td>
                  </tr>
                ) : (
                  vesselFields.map((field) => (
                    <tr key={field.fieldKey}>
                      <td>{field.displayLabel}</td>
                      <td>
                        <input
                          type="text"
                          className="gro-crew-immigration-bulk-input"
                          value={fieldValues[field.fieldKey] ?? ""}
                          onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                          placeholder={field.displayLabel}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gro-crew-immigration-bulk-right">
          <div className="gro-vessel-reg-preview-header">
            <p className="gro-crew-immigration-bulk-section-title">Document Preview</p>
            <div className="gro-vessel-reg-preview-actions">
              <button
                type="button"
                className="gro-vessel-reg-icon-btn"
                title="Generate & Download Vessel Registration PDF"
                aria-label="Generate & Download Vessel Registration PDF"
                onClick={onSave}
                disabled={isSaving || !onSave}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </span>
                ) : (
                  <FiSave />
                )}
              </button>
            </div>
          </div>
          <div ref={previewRef}>
            <VesselBoardingArabicPreview fieldValues={fieldValues} templateData={templateData} />
          </div>
        </div>
      </div>
    </div>
  );
});

VesselInwardRegistrationView.propTypes = {
  onSave: PropTypes.func,
  isSaving: PropTypes.bool,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

VesselInwardRegistrationView.displayName = "VesselInwardRegistrationView";

export default VesselInwardRegistrationView;

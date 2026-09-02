import { FileCheck } from "lucide-react";
import PropTypes from "prop-types";
import "../../../../../../../../design/scss/checklist.scss";

const DOCUMENTATION_ITEMS = [
  { key: "commercial_invoice", label: "Commercial Invoice" },
  { key: "packing_list", label: "Packing List" },
  { key: "airway_bill", label: "Airway Bill" },
  { key: "certificate_of_origin", label: "Certificate of Origin" },
  { key: "insurance", label: "Insurance" },
];

/** Documentation checklist tab — toggles save immediately (no blur-commit, unlike text fields). */
function JobDocumentationChecklist({ documentation, onPatchSection }) {
  const doc = documentation || {};

  const toggle = (key) => {
    onPatchSection("documentation", { [key]: !doc[key] });
  };

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <FileCheck size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Documentation</div>
      </div>
      <div className="cf-section-body">
        <div className="checklist-items">
          {DOCUMENTATION_ITEMS.map((item) => {
            const checked = Boolean(doc[item.key]);
            return (
              <div key={item.key} className={`checklist-item${checked ? " checked" : ""}`}>
                <label className="checklist-item-label">
                  <span className="checklist-checkbox-wrapper">
                    <input
                      type="checkbox"
                      className="checklist-checkbox"
                      checked={checked}
                      onChange={() => toggle(item.key)}
                    />
                    <span className="checklist-checkbox-custom">
                      <span className="checkmark">✓</span>
                    </span>
                  </span>
                  <span className="checklist-item-text">{item.label}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

JobDocumentationChecklist.propTypes = {
  documentation: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobDocumentationChecklist;

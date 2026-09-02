import { Package } from "lucide-react";
import PropTypes from "prop-types";
import JobFieldInput from "./JobFieldInput";

/** Cargo Details tab (Description / HS Code / Dimensions / Weight / Packaging / Condition). */
function JobCargoDetailsPanel({ cargo, onPatchSection }) {
  const c = cargo || {};
  const commit = (field) => (value) => onPatchSection("cargo", { [field]: value });

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <Package size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Cargo Details</div>
      </div>
      <div className="cf-section-body">
        <div className="cf-grid two">
          <JobFieldInput label="Description" value={c.description} onCommit={commit("description")} />
          <JobFieldInput label="HS Code" value={c.hs_code} onCommit={commit("hs_code")} />
          <JobFieldInput label="Dimensions" value={c.dimensions} onCommit={commit("dimensions")} />
          <JobFieldInput label="Weight" value={c.weight} onCommit={commit("weight")} />
          <JobFieldInput label="Packaging" value={c.packaging} onCommit={commit("packaging")} />
          <JobFieldInput label="Condition" value={c.condition} onCommit={commit("condition")} />
        </div>
      </div>
    </div>
  );
}

JobCargoDetailsPanel.propTypes = {
  cargo: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobCargoDetailsPanel;

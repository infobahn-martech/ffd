import { Truck } from "lucide-react";
import PropTypes from "prop-types";
import JobFieldInput from "./JobFieldInput";

/** Pickup Details tab (Location / Date & Time / Contact Person / Equipment). */
function JobPickupDetailsPanel({ pickup, onPatchSection }) {
  const p = pickup || {};
  const commit = (field) => (value) => onPatchSection("pickup", { [field]: value });

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <Truck size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Pickup Details</div>
      </div>
      <div className="cf-section-body">
        <div className="cf-grid two">
          <JobFieldInput label="Location" value={p.location} onCommit={commit("location")} />
          <JobFieldInput label="Date & Time" value={p.date_time} onCommit={commit("date_time")} />
          <JobFieldInput label="Contact Person" value={p.contact_person} onCommit={commit("contact_person")} />
          <JobFieldInput label="Equipment" value={p.equipment} onCommit={commit("equipment")} />
        </div>
      </div>
    </div>
  );
}

JobPickupDetailsPanel.propTypes = {
  pickup: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobPickupDetailsPanel;

import { MapPin } from "lucide-react";
import PropTypes from "prop-types";
import JobFieldInput from "./JobFieldInput";

/** Delivery Details tab (Location / Date & Time / Contact Person / Mobile). */
function JobDeliveryDetailsPanel({ delivery, onPatchSection }) {
  const d = delivery || {};
  const commit = (field) => (value) => onPatchSection("delivery", { [field]: value });

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <MapPin size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Delivery Details</div>
      </div>
      <div className="cf-section-body">
        <div className="cf-grid two">
          <JobFieldInput label="Location" value={d.location} onCommit={commit("location")} />
          <JobFieldInput label="Date & Time" value={d.date_time} onCommit={commit("date_time")} />
          <JobFieldInput label="Contact Person" value={d.contact_person} onCommit={commit("contact_person")} />
          <JobFieldInput label="Mobile" value={d.mobile} onCommit={commit("mobile")} />
        </div>
      </div>
    </div>
  );
}

JobDeliveryDetailsPanel.propTypes = {
  delivery: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobDeliveryDetailsPanel;

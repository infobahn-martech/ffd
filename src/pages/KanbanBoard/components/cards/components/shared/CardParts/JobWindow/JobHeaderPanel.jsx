import { Briefcase } from "lucide-react";
import PropTypes from "prop-types";
import JobFieldInput from "./JobFieldInput";

/**
 * Persistent Job Header row (Mode of Shipment / Handover Date / Type / Pickup /
 * Client / Location / Commercial POC / Date & Time) — shown above the tab bar,
 * always visible, matching the "Job: 12345" mockup's header row.
 */
function JobHeaderPanel({ header, onCommit }) {
  const h = header || {};
  const commit = (field) => (value) => onCommit({ [field]: value });

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <Briefcase size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Job Header</div>
      </div>
      <div className="cf-section-body">
        <div className="cf-grid two">
          <JobFieldInput label="Mode of Shipment" value={h.mode_of_shipment} onCommit={commit("mode_of_shipment")} />
          <JobFieldInput label="Job Handover Date" value={h.job_handover_date} onCommit={commit("job_handover_date")} />
          <JobFieldInput label="Type" value={h.type} onCommit={commit("type")} />
          <JobFieldInput label="Pickup" value={h.pickup ? "Yes" : "No"} onCommit={(v) => onCommit({ pickup: v.trim().toLowerCase() === "yes" })} />
          <JobFieldInput label="Client Name" value={h.client_name} onCommit={commit("client_name")} />
          <JobFieldInput label="Location" value={h.location} onCommit={commit("location")} />
          <JobFieldInput label="Commercial POC" value={h.commercial_poc} onCommit={commit("commercial_poc")} />
          <JobFieldInput label="Date & Time" value={h.date_time} onCommit={commit("date_time")} />
        </div>
      </div>
    </div>
  );
}

JobHeaderPanel.propTypes = {
  header: PropTypes.object,
  onCommit: PropTypes.func.isRequired,
};

export default JobHeaderPanel;

import { Hash, Users } from "lucide-react";
import PropTypes from "prop-types";
import JobFieldInput from "./JobFieldInput";

/**
 * Overview tab: the RFQ/Quotation/Job numbers generated through the job lifecycle
 * (system-generated, read-only — see nextFormattedNumber in src/mocks/ffd/index.js)
 * plus the nominated-party override column called out in the requirements doc.
 */
function JobOverviewTab({ numbers, nomination, onPatchSection }) {
  const n = numbers || {};
  const nom = nomination || {};

  return (
    <>
      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <Hash size={15} aria-hidden />
          </div>
          <div className="cf-section-title">Reference Numbers</div>
        </div>
        <div className="cf-section-body">
          <div className="cf-grid two">
            <JobFieldInput label="RFQ Number" value={n.rfq_number || "—"} readOnly />
            <JobFieldInput label="Quotation Number" value={n.quotation_number || "—"} readOnly />
            <JobFieldInput label="Job Number" value={n.job_number || "—"} readOnly />
          </div>
        </div>
      </div>

      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <Users size={15} aria-hidden />
          </div>
          <div className="cf-section-title">Nomination</div>
        </div>
        <div className="cf-section-body">
          <div className="cf-grid two">
            <JobFieldInput label="Proposed Party" value={nom.proposed_party || "—"} readOnly />
            <JobFieldInput
              label="Overridden Party"
              value={nom.overridden_party}
              onCommit={(value) => onPatchSection("nomination", { overridden_party: value })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

JobOverviewTab.propTypes = {
  numbers: PropTypes.object,
  nomination: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobOverviewTab;

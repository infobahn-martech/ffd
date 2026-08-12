import { useParams } from "react-router-dom";

// Landing page for the CEO email-approval deep link (/approval/ceo/:callId).
// Fetching the call and opening the Export Approval tab is wired in a follow-up task.
function CeoApproval() {
  const { callId } = useParams();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading call {callId}...</span>
      </div>
    </div>
  );
}

export default CeoApproval;

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CardForm from "../KanbanBoard/components/cards/CardForm";
import { ROUTE_PATHS } from "../../router/paths";

// Landing page for the CEO email-approval deep link (/approval/ceo/:callId).
// Reuses the existing Call Details card (CardForm) instead of a duplicate UI —
// CardForm self-fetches the full call via callFileService.getCallDetail once
// given a card object carrying call_id, so only a minimal stub is needed here.
function CeoApproval() {
  const { callId } = useParams();
  const navigate = useNavigate();

  const card = useMemo(() => ({ id: callId, call_id: callId }), [callId]);

  return (
    <CardForm
      show
      close={() => navigate(ROUTE_PATHS.DASHBOARD)}
      card={card}
      initialTab="Export Approval"
    />
  );
}

export default CeoApproval;

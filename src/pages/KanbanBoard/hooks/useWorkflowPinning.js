import { useCallback, useEffect, useState } from "react";
import {
  createWorkflowBooleanState,
  reorderWorkflowsByPinState,
} from "../utils/workflowHelpers";

export default function useWorkflowPinning(workflows, setWorkflows) {
  const [pinnedWorkflows, setPinnedWorkflows] = useState(() =>
    createWorkflowBooleanState(workflows, false)
  );

  useEffect(() => {
    setPinnedWorkflows((prev) => {
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!(workflow.id in next)) {
          next[workflow.id] = false;
        }
      });
      return next;
    });
  }, [workflows]);

  const toggleWorkflowPin = useCallback(
    (workflowId) => {
      if (!workflowId) return;
      setPinnedWorkflows((prev) => {
        const updated = {
          ...prev,
          [workflowId]: !prev[workflowId],
        };
        setWorkflows((prevWorkflows) =>
          reorderWorkflowsByPinState(updated, prevWorkflows)
        );
        return updated;
      });
    },
    [setWorkflows]
  );

  return {
    pinnedWorkflows,
    toggleWorkflowPin,
  };
}

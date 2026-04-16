import { useCallback, useEffect, useState } from "react";
import {
  createExpandedColumnsState,
  createWorkflowBooleanState,
} from "../utils/workflowHelpers";

export default function useWorkflowExpansion(workflows) {
  const [expandedWorkflows, setExpandedWorkflows] = useState(() =>
    createWorkflowBooleanState(workflows, true)
  );
  const [expandedColumns, setExpandedColumns] = useState(() =>
    createExpandedColumnsState(workflows)
  );
  const [enableExpandShrink, setEnableExpandShrink] = useState(false);

  useEffect(() => {
    setExpandedWorkflows((prev) => {
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!(workflow.id in next)) {
          next[workflow.id] = true;
        }
      });
      return next;
    });

    setExpandedColumns((prev) => {
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!(workflow.id in next)) {
          next[workflow.id] = null;
        }
      });
      return next;
    });
  }, [workflows]);

  const toggleWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows((prev) => ({
      ...prev,
      [workflowId]: !prev[workflowId],
    }));
  }, []);

  const expandWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows((prev) => ({
      ...prev,
      [workflowId]: true,
    }));
  }, []);

  const collapseWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows((prev) => ({
      ...prev,
      [workflowId]: false,
    }));
  }, []);

  const handleColumnHeaderClick = useCallback(
    (workflowId, columnId) => {
      if (!enableExpandShrink) return;
      setExpandedColumns((prev) => {
        const currentExpanded = prev[workflowId];
        return {
          ...prev,
          [workflowId]: currentExpanded === columnId ? null : columnId,
        };
      });
    },
    [enableExpandShrink]
  );

  return {
    expandedWorkflows,
    expandedColumns,
    enableExpandShrink,
    setEnableExpandShrink,
    toggleWorkflow,
    expandWorkflow,
    collapseWorkflow,
    handleColumnHeaderClick,
  };
}

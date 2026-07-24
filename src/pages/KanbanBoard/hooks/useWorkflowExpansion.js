import { useCallback, useEffect, useState } from "react";
import {
  createCollapsedColumnsState,
  createWorkflowBooleanState,
} from "../utils/workflowHelpers";

export default function useWorkflowExpansion(workflows) {
  const [expandedWorkflows, setExpandedWorkflows] = useState(() =>
    createWorkflowBooleanState(workflows, true)
  );
  const [collapsedColumns, setCollapsedColumns] = useState(() =>
    createCollapsedColumnsState(workflows)
  );

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

    setCollapsedColumns((prev) => {
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!(workflow.id in next)) {
          next[workflow.id] = new Set();
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
      setCollapsedColumns((prev) => {
        const currentSet = prev[workflowId] ?? new Set();
        const nextSet = new Set(currentSet);
        if (nextSet.has(columnId)) {
          nextSet.delete(columnId);
        } else {
          nextSet.add(columnId);
        }

        /* Collapsing every column would leave nothing to expand back into — snap back to
           the normal view instead of letting the whole board go narrow. */
        const totalColumns = workflows.find((w) => w.id === workflowId)?.columnOrder?.length ?? 0;
        if (totalColumns > 0 && nextSet.size >= totalColumns) {
          return { ...prev, [workflowId]: new Set() };
        }

        return { ...prev, [workflowId]: nextSet };
      });
    },
    [workflows]
  );

  return {
    expandedWorkflows,
    collapsedColumns,
    toggleWorkflow,
    expandWorkflow,
    collapseWorkflow,
    handleColumnHeaderClick,
  };
}

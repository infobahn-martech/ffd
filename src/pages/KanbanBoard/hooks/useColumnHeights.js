import { useCallback, useEffect, useState } from "react";
import { createWorkflowBooleanState } from "../utils/workflowHelpers";

/**
 * Tracks per-column heights (max of swimlane cell heights) and exposes the workflow-wide
 * max so every column can share the same min-height (legacy Kanban behavior).
 */
export default function useColumnHeights(workflows) {
  const [columnHeights, setColumnHeights] = useState(() => {
    const state = {};
    workflows.forEach((workflow) => {
      state[workflow.id] = {};
    });
    return state;
  });
  const [maxColumnHeights, setMaxColumnHeights] = useState(() =>
    createWorkflowBooleanState(workflows, 0)
  );

  useEffect(() => {
    setColumnHeights((prev) => {
      let changed = false;
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!next[workflow.id]) {
          next[workflow.id] = {};
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    setMaxColumnHeights((prev) => {
      let changed = false;
      const next = { ...prev };
      workflows.forEach((workflow) => {
        if (!(workflow.id in next)) {
          next[workflow.id] = 0;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [workflows]);

  const handleColumnHeightChange = useCallback((workflowsArg, columnId, height, laneId) => {
    const workflow = workflowsArg.find((item) =>
      Object.values(item.columns || {}).some((col) => col.id === columnId)
    );

    if (!workflow) return;

    setColumnHeights((prev) => {
      const prevWorkflow = prev[workflow.id] || {};
      const prevColumn = prevWorkflow[columnId] || {};
      const laneKey = laneId ?? "_";

      if (prevColumn[laneKey] === height) {
        return prev;
      }

      const nextColumnHeights = {
        ...prevWorkflow,
        [columnId]: {
          ...prevColumn,
          [laneKey]: height,
        },
      };

      const columnMaxes = Object.values(nextColumnHeights).map((laneMap) => {
        const vals = Object.values(laneMap || {});
        if (vals.length === 0) return 0;
        return Math.max(0, ...vals);
      });
      const maxHeight = columnMaxes.length > 0 ? Math.max(0, ...columnMaxes) : 0;

      setMaxColumnHeights((prevMax) => {
        if (prevMax[workflow.id] === maxHeight) {
          return prevMax;
        }
        return {
          ...prevMax,
          [workflow.id]: maxHeight,
        };
      });

      return {
        ...prev,
        [workflow.id]: nextColumnHeights,
      };
    });
  }, []);

  return {
    columnHeights,
    maxColumnHeights,
    handleColumnHeightChange,
  };
}

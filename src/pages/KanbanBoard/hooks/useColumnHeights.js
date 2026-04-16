import { useCallback, useEffect, useState } from "react";
import { createWorkflowBooleanState } from "../utils/workflowHelpers";

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

  const handleColumnHeightChange = useCallback((workflows, columnId, height) => {
    const workflow = workflows.find((item) =>
      Object.values(item.columns).some((col) => col.id === columnId)
    );

    if (!workflow) return;

    setColumnHeights((prev) => {
      const previousHeight = prev?.[workflow.id]?.[columnId];
      if (previousHeight === height) {
        return prev;
      }

      const workflowHeights = {
        ...(prev[workflow.id] || {}),
        [columnId]: height,
      };
      const newHeights = {
        ...prev,
        [workflow.id]: workflowHeights,
      };

      const heights = Object.values(workflowHeights);
      const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;

      setMaxColumnHeights((prevMax) => {
        if (prevMax[workflow.id] === maxHeight) {
          return prevMax;
        }
        return {
          ...prevMax,
          [workflow.id]: maxHeight,
        };
      });

      return newHeights;
    });
  }, []);

  return {
    columnHeights,
    maxColumnHeights,
    handleColumnHeightChange,
  };
}

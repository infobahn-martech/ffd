/**
 * Pure utility functions for workflow editor logic.
 * All functions are immutable and side-effect free.
 */

export const AREA_ORDER = [
  'BACKLOG AREA',
  'REQUESTED AREA',
  'IN PROGRESS AREA',
  'DONE AREA',
  'READY TO ARCHIVE AREA',
];

export function rgbToHex(rgb) {
  if (!rgb) return '#f9fafb';
  if (rgb.startsWith('#')) return rgb.toUpperCase();
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#f9fafb';
  return (
    '#' +
    match
      .map((x) => {
        const hex = parseInt(x, 10).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

export function normalizeRgb(rgb) {
  if (!rgb) return '';
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '';
  return `rgb(${match[0]}, ${match[1]}, ${match[2]})`;
}

/**
 * Get next unique stage ID from a workflow.
 */
export function getNextStageId(workflow) {
  const maxId = Math.max(0, ...workflow.swimlanes.flatMap((sl) => sl.stages.map((s) => s.id)));
  return maxId + 1;
}

/**
 * Get next unique swimlane ID from a workflow.
 */
export function getNextSwimlaneId(workflow) {
  const maxId = Math.max(0, ...workflow.swimlanes.map((sl) => sl.id));
  return maxId + 1;
}

/**
 * Duplicate a swimlane with new ids; new swimlane name is "New Swimlane".
 * Returns a new swimlane object (immutable).
 */
export function duplicateSwimlane(workflow, sourceSwimlane) {
  const newSwimlaneId = getNextSwimlaneId(workflow);
  const maxStageId = Math.max(0, ...workflow.swimlanes.flatMap((sl) => sl.stages.map((s) => s.id)));
  const newStages = sourceSwimlane.stages.map((s, i) => ({
    ...s,
    id: maxStageId + 1 + i,
  }));
  return {
    id: newSwimlaneId,
    name: 'New Swimlane',
    stages: newStages,
  };
}

/**
 * Build board column structure: { area, cols: number }[] - horizontal columns per area.
 */
export function getBoardColumnStructure(workflow, areaOrder = AREA_ORDER) {
  const colsPerArea = {};
  areaOrder.forEach((area) => {
    let maxCols = 0;
    workflow.swimlanes.forEach((swimlane) => {
      const stagesInArea = swimlane.stages.filter((s) => s.area === area);
      const maxColInArea =
        stagesInArea.length > 0
          ? Math.max(...stagesInArea.map((s) => (s.col ?? 0) + (s.colSpan ?? 1)))
          : 0;
      if (maxColInArea > maxCols) maxCols = maxColInArea;
      if (maxCols > (colsPerArea[area] ?? 0)) colsPerArea[area] = maxCols;
    });
  });
  return areaOrder
    .map((area) => ({ area, cols: colsPerArea[area] ?? 0 }))
    .filter((x) => x.cols > 0);
}

/**
 * Build per-area matrix: { row: { col: stage } } - stage at (row, col).
 */
export function getAreaMatrix(swimlane, area) {
  const matrix = {};
  swimlane.stages
    .filter((s) => s.area === area)
    .forEach((s) => {
      const row = s.row ?? 0;
      const col = s.col ?? 0;
      if (!matrix[row]) matrix[row] = {};
      matrix[row][col] = s;
    });
  return matrix;
}

/**
 * Get stages that occupy a specific column in an area (considers colSpan).
 */
export function getStagesInColumn(swimlane, area, colIdx) {
  return swimlane.stages
    .filter((s) => {
      if (s.area !== area) return false;
      const col = s.col ?? 0;
      const span = s.colSpan ?? 1;
      return col <= colIdx && colIdx < col + span;
    })
    .sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
}

/**
 * Get max row index in an area for grid row count.
 */
export function getMaxRowInArea(swimlane, area) {
  const stagesInArea = swimlane.stages.filter((s) => s.area === area);
  if (stagesInArea.length === 0) return -1;
  return Math.max(...stagesInArea.map((s) => s.row ?? 0));
}

/**
 * Global rows across all areas in a swimlane (for equal-height area blocks).
 */
export function getGlobalRowsForSwimlane(swimlane, boardStructure) {
  let maxRows = 0;
  boardStructure.forEach(({ area }) => {
    const rowsInArea = getMaxRowInArea(swimlane, area) + 1;
    if (rowsInArea > maxRows) maxRows = rowsInArea;
  });
  return Math.max(1, maxRows);
}

/**
 * Check if a cell (row, col) is occupied by any stage in the area.
 * For full-height single columns, all rows in that column are treated as occupied.
 */
export function isCellOccupied(areaStages, row, col, globalRows) {
  const occupyingStages = areaStages.filter((s) => {
    const sCol = s.col ?? 0;
    const sSpan = s.colSpan ?? 1;
    return sCol <= col && col < sCol + sSpan;
  });

  if (occupyingStages.length === 0) return false;

  const exactColumnStages = occupyingStages.filter(
    (s) => (s.col ?? 0) === col && (s.colSpan ?? 1) === 1
  );
  if (exactColumnStages.length === 1) {
    const sameColStages = areaStages.filter((s) => (s.col ?? 0) === col);
    if (sameColStages.length === 1) {
      return true;
    }
  }

  return areaStages.some((s) => {
    const sRow = s.row ?? 0;
    const sCol = s.col ?? 0;
    const sSpan = s.colSpan ?? 1;
    return sRow === row && sCol <= col && col < sCol + sSpan;
  });
}

/**
 * Generate unique column key for hover tracking.
 */
export function getColumnKey(workflowId, swimlaneId, stageId) {
  return `${workflowId}-${swimlaneId}-${stageId}`;
}

/**
 * Generate unique col-stack key for rail positioning.
 */
export function getColStackKey(workflowId, swimlaneId, area, colIdx) {
  return `${workflowId}-${swimlaneId}-${area}-${colIdx}`;
}

/**
 * Insert a new column to the left of the target stage.
 * Returns new stages array (immutable).
 */
export function insertColumnLeft(stages, targetStageId, newId, newStageName = 'New Column') {
  const stage = stages.find((s) => s.id === targetStageId);
  if (!stage) return stages;

  const area = stage.area;
  const targetRow = stage.row ?? 0;
  const targetCol = stage.col ?? 0;
  const span = stage.colSpan ?? 1;

  const newStage = {
    ...stage,
    id: newId,
    name: newStageName,
    row: targetRow,
    col: targetCol,
    colSpan: span,
  };

  const newStages = stages.map((s) => {
    if (s.area === area && (s.row ?? 0) === targetRow && (s.col ?? 0) >= targetCol) {
      return { ...s, col: (s.col ?? 0) + 1 };
    }
    return s;
  });
  newStages.push(newStage);
  return newStages;
}

/**
 * Insert a new column to the right of the target stage.
 * When adding beside stacked child (targetRow > 0), expands parent stages above by increasing colSpan.
 * Returns new stages array (immutable).
 */
export function insertColumnRight(stages, targetStageId, newId, newStageName = 'New Column') {
  const stage = stages.find((s) => s.id === targetStageId);
  if (!stage) return stages;

  const area = stage.area;
  const targetRow = stage.row ?? 0;
  const targetCol = (stage.col ?? 0) + 1;

  const newStage = {
    ...stage,
    id: newId,
    name: newStageName,
    row: targetRow,
    col: targetCol,
    colSpan: stage.colSpan ?? 1,
  };

  const newStages = stages.map((s) => {
    if (s.area === area && (s.row ?? 0) === targetRow && (s.col ?? 0) >= targetCol) {
      return { ...s, col: (s.col ?? 0) + 1 };
    }
    // Expand parent stages above when adding beside stacked child (targetRow > 0)
    if (targetRow > 0 && s.area === area && (s.row ?? 0) === targetRow - 1) {
      const sCol = s.col ?? 0;
      const sSpan = s.colSpan ?? 1;
      const stageCol = stage.col ?? 0;
      if (sCol <= stageCol && sCol + sSpan > stageCol) {
        return { ...s, colSpan: (s.colSpan ?? 1) + 1 };
      }
    }
    return s;
  });
  newStages.push(newStage);
  return newStages;
}

/**
 * Insert a new subcolumn below the target stage in the same column.
 * Returns new stages array (immutable).
 */
export function insertSubcolumnBelow(stages, targetStageId, newId, newStageName = 'New Column') {
  const stage = stages.find((s) => s.id === targetStageId);
  if (!stage) return stages;

  const area = stage.area;
  const currentRow = stage.row ?? 0;
  const currentCol = stage.col ?? 0;
  const insertRow = currentRow + 1;

  const newStage = {
    ...stage,
    id: newId,
    name: newStageName,
    area,
    row: insertRow,
    col: currentCol,
    colSpan: 1,
    limit: stage.limit ?? 0,
    cardsPerRow: stage.cardsPerRow ?? 1,
  };

  const newStages = stages.map((s) => {
    if (s.area === area && (s.col ?? 0) === currentCol && (s.row ?? 0) >= insertRow) {
      return { ...s, row: (s.row ?? 0) + 1 };
    }
    return s;
  });
  newStages.push(newStage);
  return newStages;
}

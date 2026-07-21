/**
 * Resolves the stable column id used by CardForm / DnD (e.g. workflow-1-col-1).
 */
export const getColumnStableId = (column) => column?.id;

/**
 * Cards for one swimlane cell (column key + lane).
 */
export const getSwimlaneColumnCards = (workflow, laneId, columnKey) => {
  const lane = workflow.swimlanes?.[laneId];
  const ids = lane?.cardMap?.[columnKey] ?? [];
  return ids.map((id) => workflow.cards[id]).filter(Boolean);
};

/**
 * Total cards in a column across all swimlanes (for WIP / header counts).
 */
export const countCardsInColumn = (workflow, columnKey) => {
  if (!workflow.swimlaneOrder || !workflow.swimlanes) return 0;
  let n = 0;
  for (const laneId of workflow.swimlaneOrder) {
    const ids = workflow.swimlanes[laneId]?.cardMap?.[columnKey];
    if (Array.isArray(ids)) n += ids.length;
  }
  return n;
};

/**
 * Groups consecutive columns in `columnOrder` that share the same `parentColumnId` (children of
 * a split column, e.g. API `column.children`) into one header group. Ungrouped columns are a
 * group of one. Used to render a single merged header spanning N grid tracks.
 */
export const getColumnHeaderGroups = (workflow) => {
  const order = workflow.columnOrder || [];
  const groups = [];
  let i = 0;
  while (i < order.length) {
    const colKey = order[i];
    const parentColumnId = workflow.columns[colKey]?.parentColumnId ?? null;

    if (parentColumnId == null) {
      groups.push({ key: colKey, colKeys: [colKey], parentColumnId: null });
      i += 1;
      continue;
    }

    const colKeys = [colKey];
    let j = i + 1;
    while (j < order.length && workflow.columns[order[j]]?.parentColumnId === parentColumnId) {
      colKeys.push(order[j]);
      j += 1;
    }
    groups.push({ key: `group-${parentColumnId}`, colKeys, parentColumnId });
    i = j;
  }
  return groups;
};

export const findLaneColumnLocationForCard = (workflow, cardId) => {
  if (!workflow.swimlaneOrder || !workflow.swimlanes) return null;
  for (const laneId of workflow.swimlaneOrder) {
    const lane = workflow.swimlanes[laneId];
    if (!lane?.cardMap) continue;
    for (const colKey of workflow.columnOrder) {
      const ids = lane.cardMap[colKey];
      if (Array.isArray(ids) && ids.includes(cardId)) {
        return { laneId, columnKey: colKey };
      }
    }
  }
  return null;
};

export const findColumnByCardId = (workflows, cardId) => {
  for (const workflow of workflows) {
    const loc = findLaneColumnLocationForCard(workflow, cardId);
    if (loc && workflow.columns?.[loc.columnKey]) {
      return workflow.columns[loc.columnKey];
    }
  }
  return null;
};

export const findColumnLocationById = (workflows, columnId) => {
  for (let workflowIndex = 0; workflowIndex < workflows.length; workflowIndex += 1) {
    const workflow = workflows[workflowIndex];
    const columnKey = Object.keys(workflow.columns || {}).find(
      (key) => workflow.columns[key].id === columnId
    );
    if (columnKey) {
      return {
        workflowIndex,
        workflow,
        columnKey,
        column: workflow.columns[columnKey],
      };
    }
  }
  return null;
};

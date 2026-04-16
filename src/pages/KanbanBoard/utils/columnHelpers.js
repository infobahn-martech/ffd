export const findColumnByCardId = (workflows, cardId) => {
  for (const workflow of workflows) {
    for (const colId of workflow.columnOrder) {
      const column = workflow.columns[colId];
      if (column.cardIds.includes(cardId)) {
        return column;
      }
    }
  }
  return null;
};

export const findColumnLocationById = (workflows, columnId) => {
  for (let workflowIndex = 0; workflowIndex < workflows.length; workflowIndex += 1) {
    const workflow = workflows[workflowIndex];
    const columnKey = Object.keys(workflow.columns).find(
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

export const getColumnCards = (workflow, column) =>
  column.cardIds.map((id) => workflow.cards[id]);

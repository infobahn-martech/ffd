export const createWorkflowBooleanState = (workflows, initialValue) => {
  const state = {};
  workflows.forEach((workflow) => {
    state[workflow.id] = initialValue;
  });
  return state;
};

export const createCollapsedColumnsState = (workflows) => {
  const state = {};
  workflows.forEach((workflow) => {
    state[workflow.id] = new Set();
  });
  return state;
};

export const reorderWorkflowsByPinState = (pinState, currentWorkflows) => {
  const pinned = currentWorkflows.filter((workflow) => pinState[workflow.id]);
  const unpinned = currentWorkflows.filter((workflow) => !pinState[workflow.id]);
  return [...pinned, ...unpinned];
};

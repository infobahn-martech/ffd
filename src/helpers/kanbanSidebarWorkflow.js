/**
 * Resolves which workflow supplies columns for CardForm in add mode when the new card is not yet on the board.
 */
export function getAddModeCardFormWorkflow(workflows, isAddMode, selectedCardWorkflow, addTargetWorkflowId) {
  if (!isAddMode || selectedCardWorkflow) return selectedCardWorkflow;
  if (addTargetWorkflowId != null && addTargetWorkflowId !== '') {
    const found = workflows.find(
      (w) => w.id === addTargetWorkflowId || String(w.id) === String(addTargetWorkflowId)
    );
    if (found) return found;
  }
  return workflows.length > 0 ? workflows[0] : null;
}

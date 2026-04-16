export const findWorkflowByCardId = (workflows, cardId) =>
  workflows.find((workflow) =>
    Object.values(workflow.cards).some((card) => card.id === cardId)
  ) || null;

export const resolveCardFormBoardId = (workflow) =>
  workflow?.boardId ?? workflow?.id;

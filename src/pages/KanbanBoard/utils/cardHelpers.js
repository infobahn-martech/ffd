export const createNewCardDraft = (color, swimlaneId) => ({
  id: `new-${Date.now()}`,
  title: "",
  color: color || "#2A00FF",
  ...(swimlaneId !== undefined && swimlaneId !== null && String(swimlaneId).trim() !== ""
    ? { swimlane_id: swimlaneId }
    : {}),
});

export const createNewCardDraft = (color) => ({
  id: `new-${Date.now()}`,
  title: "",
  color: color || "#2A00FF",
});

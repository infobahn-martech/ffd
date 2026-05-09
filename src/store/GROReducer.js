/**
 * Pure helpers for GRO task-card documents (API status ↔ UI row styling).
 */
export const isGroDocumentApproved = (doc) => {
  const s = doc?.status;
  const n = Number(s);
  return n === 1 || String(s).toLowerCase() === "verified";
};

export const isGroDocumentRejected = (doc) => {
  const s = doc?.status;
  const n = Number(s);
  return n === 2 || String(s).toLowerCase() === "reupload";
};

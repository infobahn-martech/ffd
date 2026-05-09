/**
 * Pure helpers for GRO task-card documents (numeric status from API).
 */
export const isGroDocumentApproved = (doc) => Number(doc?.status) === 1;

export const isGroDocumentRejected = (doc) => Number(doc?.status) === 2;

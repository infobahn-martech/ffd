/** Resolve task id for GET task_card/get_documents_by_task/{task_id}. */
export const resolveGroSupervisorTaskId = (card, selectedTask = null) => {
  const candidates = [
    selectedTask?.task_id,
    selectedTask?.taskId,
    card?.taskId,
    card?.task_id,
    card?.raw?.task_id,
  ];
  for (const value of candidates) {
    if (value == null || String(value).trim() === "") continue;
    return String(value).trim();
  }
  return null;
};

export const parseDocumentsByTaskResponse = (res) => {
  const docs = res?.data?.documents;
  return Array.isArray(docs) ? docs : [];
};

/** Map API documents to GROSupervisorDocumentLibrary row shape. */
export const mapGroSupervisorDocuments = (apiDocuments) =>
  (apiDocuments || []).map((doc, index) => ({
    ...doc,
    __rowKey: `${doc.document_id}-${doc.call_task_document_id || index}`,
    is_uploaded: Boolean(doc.file_url || doc.file_name),
    file_name: doc.file_name || null,
    file_url: doc.file_url || null,
    status: Number(doc.status ?? 0),
  }));

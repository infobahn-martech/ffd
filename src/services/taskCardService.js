import Gateway from "../gateway/gateway";

const assignTask = (payload) => Gateway.post("task_card/assign_task", payload);

const startTask = (cardId, taskId) =>
  Gateway.get(`task_card/start_task/${encodeURIComponent(String(cardId))}`, {
    params: { task_id: taskId ?? "" },
  });

/** @param {{ card_name: string, task_name: string, assigned_to: string|number, due_date: string }} payload */
const createTaskCard = (payload) => Gateway.post("kanban_card/create_task_card", payload);

/** @param {{ card_id: string|number, comment_text: string, mentioned_user_id?: string|number|null, parent_comment_id?: string|number|null }} payload */
const addComment = (payload) => Gateway.post("kanban_card/add_comment", payload);

const getComments = (cardId) =>
  Gateway.get(`kanban_card/get_comments/${encodeURIComponent(String(cardId))}`);

const deleteComment = (commentId) =>
  Gateway.post(`kanban_card/delete_comment/${encodeURIComponent(String(commentId))}`);

/** POST multipart FormData — { card_id, documents[] } */
const uploadCardDocuments = (formData) => Gateway.post("task_card/upload_card_documents", formData);

const getCardDocuments = (cardId) =>
  Gateway.get(`kanban_card/get_card_documents/${encodeURIComponent(String(cardId))}`);

const taskCardService = {
  assignTask,
  startTask,
  createTaskCard,
  addComment,
  getComments,
  deleteComment,
  uploadCardDocuments,
  getCardDocuments,
};

export default taskCardService;

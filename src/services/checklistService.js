import Gateway from '../gateway/gateway';

const getChecklist = (params) => Gateway.get('/checklist', { params });
const getChecklistById = (checklist_type_id) =>
  Gateway.post(`checklist/get_checklist_by_id/${checklist_type_id}`, { checklist_type_id });
const deleteChecklist = (id) => Gateway.delete(`checklist/${id}`);

/** POST checklist/createchecklist - data can be FormData (with files) or JSON */
const createChecklist = (data) => Gateway.post('checklist/createchecklist', data);

/** POST checklist/updatechecklist - data can be FormData (with files) or JSON; must include _id/checklist_id */
const updateChecklist = (data) => Gateway.post('checklist/updatechecklist', data);

export default {
    createChecklist,
    updateChecklist,
    getChecklist,
    getChecklistById,
    deleteChecklist,
};

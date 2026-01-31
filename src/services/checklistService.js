import Gateway from '../gateway/gateway';

const postChecklist = (data) => Gateway.post('/checklist', data);
const getChecklist = (params) => Gateway.get('/checklist', { params });
const editChecklist = (id, data) => Gateway.patch(`checklist/${id}`, data);
const deleteChecklist = (id) => Gateway.delete(`checklist/${id}`);

export default {
    postChecklist,
    editChecklist,
    getChecklist,
    deleteChecklist,
};

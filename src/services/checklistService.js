import Gateway from '../gateway/gateway';

const getChecklist = (params) => Gateway.get('/checklist', { params });
const getChecklistByType = (params) =>
  Gateway.get('checklist/get_checklist_by_type', { params });
const getChecklistById = (checklist_type_id) =>
  Gateway.post(`checklist/get_checklist_by_id/${checklist_type_id}`, { checklist_type_id });

/** POST checklist/checklist_by_vesseltype — body: { vessel_type_id, calltype } */
const getChecklistsByVesselType = (payload) =>
  Gateway.post('checklist/checklist_by_vesseltype', payload);

/** POST checklist/checklist_by_bargetype — body: { barge_type_id, calltype } */
const getChecklistsByBargeType = (payload) =>
  Gateway.post('checklist/checklist_by_bargetype', payload);

const deleteChecklist = (id) => Gateway.delete(`checklist/${id}`);

/** POST checklist/createchecklist - data can be FormData (with files) or JSON */
const createChecklist = (data) => Gateway.post('checklist/createchecklist', data);

/** POST checklist/updatechecklist - data can be FormData (with files) or JSON; must include _id/checklist_id */
const updateChecklist = (data) => Gateway.post('checklist/updatechecklist', data);

export default {
    createChecklist,
    updateChecklist,
    getChecklist,
    getChecklistByType,
    getChecklistById,
    getChecklistsByVesselType,
    getChecklistsByBargeType,
    deleteChecklist,
};

import Gateway from '../gateway/gateway';

const getAllOperators = () => Gateway.get('/call_file/get_all_operators');
const getAllManagers = () => Gateway.get('/call_file/get_all_managers');
const getEntityFields = (entityId) => Gateway.post(`/call_file/get_entity_fields/${entityId}`, { entity_id: entityId });
const createCallFile = (body) => Gateway.post('/call_file/create_call_file', body);
const getCallDetail = (callId) => Gateway.get(`/call_file/get_call_detail/${callId}`);
const allDetailByVesselId = (payload) => Gateway.post('/call_file/all_detail_by_vessel_id', payload);
const getAllDetailByVesselId = allDetailByVesselId;
const uploadEmailAttachments = (formData) => Gateway.post('/call_file/upload_email_attachments', formData);

export default {
  getAllOperators,
  getAllManagers,
  getEntityFields,
  createCallFile,
  getCallDetail,
  allDetailByVesselId,
  getAllDetailByVesselId,
  uploadEmailAttachments,
};

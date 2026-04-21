import Gateway from '../gateway/gateway';

const getAllOperators = () => Gateway.get('/call_file/get_all_operators');
const getEntityFields = (entityId) => Gateway.post(`/call_file/get_entity_fields/${entityId}`, { entity_id: entityId });
const createCallFile = (body) => Gateway.post('/call_file/create_call_file', body);
const getCallDetail = (callId) => Gateway.get(`/call_file/get_call_detail/${callId}`);
const getAllDetailByVesselId = (body) => Gateway.post('/call_file/all_detail_by_vessel_id', body);

export default { getAllOperators, getEntityFields, createCallFile, getCallDetail, getAllDetailByVesselId };

import Gateway from '../gateway/gateway';

const saveInboundOrder = (data) => Gateway.post('/material_management/save_inbound', data);
const getAllInbound = (params) => Gateway.get('/material_management/get_all_inbound', { params });
const getInboundById = (inboundId) => Gateway.get(`/material_management/get_inbound_by_id/${inboundId}`);

export default { saveInboundOrder, getAllInbound, getInboundById };

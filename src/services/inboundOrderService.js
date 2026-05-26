import Gateway from '../gateway/gateway';

const saveInboundOrder = (data) => Gateway.post('/material_management/save_inbound', data);
const getAllInbound = (params) => Gateway.get('/material_management/get_all_inbound', { params });
const getInboundById = (inboundId) => Gateway.get(`/material_management/get_inbound_by_id/${inboundId}`);
const updateInboundOrder = (inboundId, data) => Gateway.post(`/material_management/update_inbound/${inboundId}`, data);
const deleteInboundOrder = (inboundId) =>
  Gateway.post(`/material_management/delete_inbound/${inboundId}`);
const convertInboundToLandingNote = (formData) =>
  Gateway.post('/material_management/convert_inbound_to_landing_note', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export default { saveInboundOrder, getAllInbound, getInboundById, updateInboundOrder, deleteInboundOrder, convertInboundToLandingNote };

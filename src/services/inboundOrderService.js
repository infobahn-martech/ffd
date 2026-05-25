import Gateway from '../gateway/gateway';

const getAllInbound = (params) => Gateway.get('/material_management/get_all_inbound', { params });
const getInboundById = (id) => Gateway.get(`/material_management/get_inbound_by_id/${id}`);
const saveInbound = (data) => Gateway.post('/material_management/save_inbound', data);
const updateInbound = (id, data) => Gateway.put(`/material_management/update_inbound/${id}`, data);
const deleteInbound = (id) => Gateway.post(`/material_management/delete_inbound/${id}`);
const convertInboundToLandingNote = (formData) =>
  Gateway.post('/material_management/convert_inbound_to_landing_note', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default { getAllInbound, getInboundById, saveInbound, updateInbound, deleteInbound, convertInboundToLandingNote };

import Gateway from '../gateway/gateway';

const addMaterialType = (data) => Gateway.post('/material/add_material_type', data);
const getMaterialTypes = ({ params }) => Gateway.get('/material/get_all_material_type', { params });
const updateMaterialType = (data) => Gateway.post(`/material/update_material_type`, data);
const deleteMaterialType = (id) => Gateway.delete(`/material/delete_material_type/${id}`);

export default { addMaterialType, getMaterialTypes, updateMaterialType, deleteMaterialType };

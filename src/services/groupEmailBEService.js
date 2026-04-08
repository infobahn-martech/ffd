import Gateway from '../gateway/gateway';

const addGroupEmailBE = (data) => Gateway.post('/billingentity/addgroupemail', data);
const fetchGroupEmailBEs = ({ params }) => Gateway.get('/billingentity/getallemail', { params });
const fetchGroupEmailBEByEntity = (billingentity_id) =>
    Gateway.get(`/billingentity/getallemailbyentity/${billingentity_id}`);
const updateGroupEmailBE = (data) => Gateway.post(`/billingentity/updategroupemail`, data);
const deleteGroupEmailBE = (id) => Gateway.delete(`/billingentity/deletegroupemail/${id}`);

export default {
    addGroupEmailBE,
    fetchGroupEmailBEs,
    fetchGroupEmailBEByEntity,
    updateGroupEmailBE,
    deleteGroupEmailBE,
};

import Gateway from '../gateway/gateway';

const addGroupEmailBE = (data) => Gateway.post('/billingentity/addgroupemail', data);
const fetchGroupEmailBEs = ({ params }) => Gateway.get('/billingentity/getallemail', { params });
const updateGroupEmailBE = (data) => Gateway.post(`/billingentity/updategroupemail`, data);
const deleteGroupEmailBE = (id) => Gateway.delete(`/billingentity/deletegroupemail/${id}`);

export default { addGroupEmailBE, fetchGroupEmailBEs, updateGroupEmailBE, deleteGroupEmailBE };

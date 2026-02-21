import Gateway from '../gateway/gateway';

const addGroupEmailBE = (data) => Gateway.post('/billingentity/addemail', data);
const fetchGroupEmailBEs = ({ params }) => Gateway.get('/billingentity/getallemail', { params });
const updateGroupEmailBE = (data) => Gateway.post(`/billingentity/updateemail`, data);
const deleteGroupEmailBE = (id) => Gateway.delete(`/billingentity/deleteemail/${id}`);

export default { addGroupEmailBE, fetchGroupEmailBEs, updateGroupEmailBE, deleteGroupEmailBE };

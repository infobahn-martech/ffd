import Gateway from '../gateway/gateway';

const addTransportCompanyData = (data) => Gateway.post('/transport/add_transport_company', data);
const getTransportCompanyData = ({ params }) => Gateway.get('/transport/get_all_transport_companies', { params });
const updateTransportCompanyData = (data) => Gateway.post('/transport/update_transport_company', data);
const deleteTransportCompanyData = (id) => Gateway.delete(`/transport/delete_transport_company/${id}`);

export default { addTransportCompanyData, getTransportCompanyData, updateTransportCompanyData, deleteTransportCompanyData };

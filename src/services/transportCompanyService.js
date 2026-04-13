import Gateway from '../gateway/gateway';

const addTransportCompanyData = (data) => Gateway.post('/transport/add_transport_company', data);

const getTransportCompanyData = ({ params }) =>
  Gateway.get('/transport/get_all_transport_company', { params });

const getTransportCompanyById = (transport_company_id) =>
  Gateway.get(`/transport/get_company_by_id/${transport_company_id}`);

const updateTransportCompanyData = (transport_company_id, data) =>
  Gateway.post(`/transport/update_transport_company/${transport_company_id}`, data);

const deleteTransportCompanyData = (transport_company_id) =>
  Gateway.delete(`/transport/delete_transport_company/${transport_company_id}`);

export default {
  addTransportCompanyData,
  getTransportCompanyData,
  getTransportCompanyById,
  updateTransportCompanyData,
  deleteTransportCompanyData,
};

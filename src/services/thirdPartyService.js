import Gateway from '../gateway/gateway';

const addThirdPartyService = (data) => Gateway.post('/service/add_third_party_service', data);
const getThirdPartyServices = ({ params }) => Gateway.get('/service/get_all_third_party_service', { params });
const updateThirdPartyService = (data) => Gateway.post(`/service/update_third_party_service`, data);
const deleteThirdPartyService = (id) => Gateway.delete(`/service/delete_third_party_service/${id}`);

export default { addThirdPartyService, getThirdPartyServices, updateThirdPartyService, deleteThirdPartyService };

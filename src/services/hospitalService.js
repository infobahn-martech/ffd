import Gateway from '../gateway/gateway';

const addHospital = (data) => Gateway.post('/hospital/add_hospital', data);
const getHospitalData = ({ params }) => Gateway.get('/hospital/get_all_hospital', { params });
const updateHospital = (data) => Gateway.post(`/hospital/update_hospital`, data);
const deleteHospital = (id) => Gateway.delete(`/hospital/delete_hospital/${id}`);

export default { addHospital, getHospitalData, updateHospital, deleteHospital };

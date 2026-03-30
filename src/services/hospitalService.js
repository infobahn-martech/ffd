import Gateway from '../gateway/gateway';

const addHospital = (data) => Gateway.post('/medical/add_hospital', data);

const getHospitalData = ({ params }) => {
  const p = params || {};
  const apiParams = {
    search: p.searchTerm ?? p.search ?? '',
    page: p.page,
    limit: p.limit,
  };
  if (p.sortBy) apiParams.sort_by = p.sortBy;
  return Gateway.get('/medical/get_all_hospitals', { params: apiParams });
};

const getHospitalById = (hospitalId) =>
  Gateway.get(`/medical/get_hospital_by_id/${hospitalId}`);

const updateHospital = (data) => {
  const { hospital_id, ...body } = data;
  return Gateway.post(`/medical/update_hospital/${hospital_id}`, body);
};

const deleteHospital = (id) => Gateway.delete(`/hospital/delete_hospital/${id}`);

export default {
  addHospital,
  getHospitalData,
  getHospitalById,
  updateHospital,
  deleteHospital,
};

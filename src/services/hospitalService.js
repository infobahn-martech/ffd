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

const addMedicalService = (data) => Gateway.post('/medical/add_medical_service', data);

const getMedicalServiceData = ({ params }) => {
  const p = params || {};
  const apiParams = {
    search: p.searchTerm ?? p.search ?? '',
    page: p.page,
    limit: p.limit,
  };
  if (p.sortBy) apiParams.sort_by = p.sortBy;
  return Gateway.get('/medical/get_all_medical_services', { params: apiParams });
};

const getMedicalServiceById = (serviceId) =>
  Gateway.get(`/medical/get_medical_service_by_id/${serviceId}`);

const updateMedicalService = (data) => {
  const { service_id, ...body } = data;
  return Gateway.post(`/medical/update_medical_service/${service_id}`, body);
};

const deleteMedicalService = (serviceId) =>
  Gateway.delete(`/medical/delete_medical_service/${serviceId}`);

const deleteHospitalService = (hospitalServiceId) =>
  Gateway.delete(`/medical/delete_hospital_service/${hospitalServiceId}`);

const getAllHospitalServices = ({ params }) => {
  const p = params || {};
  const apiParams = {
    search: p.searchTerm ?? p.search ?? '',
    page: p.page,
    limit: p.limit,
  };
  if (p.sortBy) apiParams.sort_by = p.sortBy;
  return Gateway.get('/medical/get_all_hospital_services', { params: apiParams });
};

const addUpdateHospitalService = (data) =>
  Gateway.post('/medical/add_update_hospital_service', data);

const getServiceByHospital = (hospitalId) =>
  Gateway.get(`/medical/get_service_by_hospital/${hospitalId}`);

export default {
  addHospital,
  getHospitalData,
  getHospitalById,
  updateHospital,
  deleteHospital,
  addMedicalService,
  getMedicalServiceData,
  getMedicalServiceById,
  updateMedicalService,
  deleteMedicalService,
  deleteHospitalService,
  getAllHospitalServices,
  addUpdateHospitalService,
  getServiceByHospital,
};

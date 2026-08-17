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

const deleteHospital = (id) => Gateway.delete(`/medical/delete_hospital/${id}`);

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

const createMedicalRequest = (formData) =>
  Gateway.post('/medical/create_medical_request', formData);

const getMedicalRequests = (callId) =>
  Gateway.get(`/medical/get_medical_requests/${encodeURIComponent(String(callId))}`);

/**
 * Normalize medical requests from axios response.
 */
export const extractMedicalRequestsFromEnvelope = (responseEnvelope) => {
  const envelope = responseEnvelope?.data?.data ?? responseEnvelope?.data ?? [];
  if (Array.isArray(envelope)) return envelope;
  if (Array.isArray(envelope?.data)) return envelope.data;
  if (envelope && typeof envelope === 'object') return [envelope];
  return [];
};

/**
 * Flatten work-order medical requests (each with nested `crew[]`) into table rows.
 */
export const flattenMedicalRequestRows = (workOrders) => {
  if (!Array.isArray(workOrders) || workOrders.length === 0) return [];

  const hasNestedCrew = workOrders.some((item) => Array.isArray(item?.crew));
  if (!hasNestedCrew) return workOrders;

  const rows = [];
  workOrders.forEach((wo) => {
    const woNumber = wo?.wo_number ?? wo?.woNumber ?? '';
    const medicalRequestId = wo?.medical_request_id ?? wo?.id;
    const hospitalName = wo?.hospital_name ?? wo?.hospitalName ?? '';
    const serviceName = wo?.service_name ?? wo?.medical_service_name ?? '';
    const requestedDate = wo?.requested_date ?? wo?.created_date ?? '';
    const crewList = Array.isArray(wo?.crew) ? wo.crew : [];

    if (crewList.length === 0) {
      rows.push({
        wo_number: woNumber,
        wo_id: wo?.wo_id,
        medical_request_id: medicalRequestId,
        hospital_name: hospitalName,
        service_name: serviceName,
        requested_date: requestedDate,
        status: wo?.status ?? '',
      });
      return;
    }

    crewList.forEach((crew) => {
      rows.push({
        ...crew,
        wo_number: woNumber || crew?.wo_number,
        wo_id: wo?.wo_id ?? crew?.wo_id,
        medical_request_id: medicalRequestId ?? crew?.medical_request_id,
        medical_request_crew_id: crew?.medical_request_crew_id ?? crew?.id,
        hospital_name: hospitalName || crew?.hospital_name,
        service_name: serviceName || crew?.service_name,
        requested_date: requestedDate || crew?.requested_date,
        status: crew?.visit_status ?? crew?.status ?? wo?.status,
        crew_name: crew?.crew_name ?? crew?.crewName,
        id: crew?.medical_request_crew_id ?? `${medicalRequestId}-${crew?.crew_change_id}`,
      });
    });
  });

  return rows;
};

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
  createMedicalRequest,
  getMedicalRequests,
};

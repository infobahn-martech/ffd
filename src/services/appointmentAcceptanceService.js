import Gateway from '../gateway/gateway';

const getTemplateByTemplateId = (template_id) =>
  Gateway.get(`/appointment/template_by_templateid/${template_id}`);

const addAppointmentAcceptance = (data) =>
  Gateway.post('/appointment/createtemplate', data);

const getAppointmentAcceptanceData = ({ params }) =>
  Gateway.get('/appointment/template', { params });

const updateAppointmentAcceptance = (payload) =>
  Gateway.post(`/appointment/edittemplate/${payload.template_id}`, payload);

const deleteAppointmentAcceptance = (template_id) =>
  Gateway.delete(`/appointment/template/${template_id}`);

export default {
  getTemplateByTemplateId,
  addAppointmentAcceptance,
  getAppointmentAcceptanceData,
  updateAppointmentAcceptance,
  deleteAppointmentAcceptance,
};

import Gateway from '../gateway/gateway';

const addAppointmentAcceptance = (data) => Gateway.post('/appointment/createtemplate', data);
const getAppointmentAcceptanceData = ({ params }) => Gateway.get('/appointment/template', { params });
const updateAppointmentAcceptance = ({ template_id, data }) => Gateway.post(`appointment/updatetemplate/${template_id}`, data);
const deleteAppointmentAcceptance = (template_id) => Gateway.delete(`appointment/template/${template_id}`);

export default { addAppointmentAcceptance, getAppointmentAcceptanceData, updateAppointmentAcceptance, deleteAppointmentAcceptance };

import Gateway from '../gateway/gateway';

const getReportTemplates = ({ params }) =>
  Gateway.get('/report_template/template', { params });

const getReportTypes = () =>
  Gateway.get('/report_template/all_report_types');

const getTemplateByTemplateId = (template_id) =>
  Gateway.get(`/report_template/template_by_templateid/${template_id}`);

const createReportTemplate = (data) =>
  Gateway.post('/report_template/createtemplate', data);

const updateReportTemplate = (payload) =>
  Gateway.post('/report_template/updatetemplate', payload);

const deleteReportTemplate = (template_id) =>
  Gateway.delete(`/report_template/template/${template_id}`);

export default {
  getReportTemplates,
  getReportTypes,
  getTemplateByTemplateId,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
};

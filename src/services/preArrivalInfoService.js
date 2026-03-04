import Gateway from '../gateway/gateway';

const getAllTemplates = (params) =>
  Gateway.get('pre_arrival_info_template/get_all_template', { params });

const getTemplateUserTypes = (params) =>
  Gateway.get('pre_arrival_info_template/get_template_usertype', { params });

const addTemplate = (data) =>
  Gateway.post('pre_arrival_info_template/add_template', data);

const updateTemplate = (templateId, data) =>
  Gateway.post(`pre_arrival_info_template/update_template/${templateId}`, data);

export default {
  getAllTemplates,
  getTemplateUserTypes,
  addTemplate,
  updateTemplate,
};

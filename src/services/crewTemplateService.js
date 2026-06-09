import Gateway from '../gateway/gateway';

/** GET crew_template/get_all_templates - returns { template_id, template_name, port_id, port, call_type_id, call_type, file_name, file_path, uploaded_at }[] */
const getAllTemplates = (params) =>
  Gateway.get('crew_template/get_all_templates', { params });

/** POST crew_template/add_template - FormData: { template_name, port_id, call_type_id, template_file } */
const addTemplate = (formData) =>
  Gateway.post('crew_template/add_template', formData);

/** POST crew_template/update_template/{template_id} - FormData: { template_id, template_name, port_id, call_type_id, template_file? } */
const updateTemplate = (templateId, formData) =>
  Gateway.post(`crew_template/update_template/${templateId}`, formData);

/** DELETE crew_template/delete_template/{template_id} */
const deleteTemplate = (templateId) =>
  Gateway.delete(`crew_template/delete_template/${templateId}`);

export default {
  getAllTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
};

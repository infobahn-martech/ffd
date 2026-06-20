import Gateway from '../gateway/gateway';

const getAll = (params) => Gateway.get('/pass_template/get_all_templates', { params });
const create = (data) => Gateway.post('/pass_template/add_template', data);
const update = ({ template_id, ...data }) => Gateway.post(`/pass_template/update_template/${template_id}`, data);
const remove = (id) => Gateway.post(`/pass_template/delete_template/${id}`);

export default { getAll, create, update, remove };

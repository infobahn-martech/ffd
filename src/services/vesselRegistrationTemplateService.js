import Gateway from '../gateway/gateway';

const getAll = (params) => Gateway.get(`/pass_template/templates_by_type/${encodeURIComponent('Vessel Registration')}`, { params });
const getById = (id) => Gateway.get(`/pass_template/template_by_id/${id}`);
const create = (data) => Gateway.post('/pass_template/add_template', data);
const update = ({ template_id, ...data }) => Gateway.post(`/pass_template/update_template/${template_id}`, data);
const remove = (id) => Gateway.post(`/pass_template/delete_template/${id}`);

export default { getAll, getById, create, update, remove };

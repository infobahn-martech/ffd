import Gateway from '../gateway/gateway';

const prospectValidate = (data) => Gateway.post('/prospect', data);
const getProspectValidate = ({ params }) =>
  Gateway.get('/prospect', { params });
const editProspect = (id, data) => Gateway.patch(`/prospect/${id}`, data);
const deleteProspect = (id) => Gateway.delete(`/prospect/${id}`);

export default {
  prospectValidate,
  getProspectValidate,
  editProspect,
  deleteProspect,
};

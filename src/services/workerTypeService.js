import Gateway from '../gateway/gateway';

const postWorkerType = (data) => Gateway.post('/workerType', data);
const getWorkerType = (params) => Gateway.get('/workerType', { params });
const editWorkerType = (id, data) => Gateway.patch(`workerType/${id}`, data);
const deleteWorkerType = (id) => Gateway.delete(`workerType/${id}`);

export default {
  postWorkerType,
  editWorkerType,
  getWorkerType,
  deleteWorkerType,
};

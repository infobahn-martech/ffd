import Gateway from '../gateway/gateway';

const postWorker = (data) => Gateway.post('/worker', data);
const getWorker = (params) => Gateway.get('/worker', { params });
const editWorker = (id, data) => Gateway.patch(`worker/${id}`, data);
const deleteWorker = (id) => Gateway.delete(`worker/${id}`);

export default {
  postWorker,
  editWorker,
  getWorker,
  deleteWorker,
};

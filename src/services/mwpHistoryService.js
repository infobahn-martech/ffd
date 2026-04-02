import Gateway from '../gateway/gateway';

const getAllMWPHistory = ({ params } = {}) =>
  Gateway.get('/vessel/all_mwp_history', { params });

export default {
  getAllMWPHistory,
};

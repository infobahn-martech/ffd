import Gateway from '../gateway/gateway';

const getAllCrews = (params) => Gateway.get('/crew/get_all_crew', { params });

export default {
    getAllCrews,
};

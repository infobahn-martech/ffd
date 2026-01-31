import Gateway from '../gateway/gateway';

const getCallTypes = () => Gateway.get('/calltype');

export default {
    getCallTypes,
};

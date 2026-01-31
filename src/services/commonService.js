import Gateway from '../gateway/gateway';

const getCallTypes = () => Gateway.get('/call-type');

export default {
    getCallTypes,
};

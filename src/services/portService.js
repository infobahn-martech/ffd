import Gateway from '../gateway/gateway';

const getPorts = ({ params }) => Gateway.get('/ports', { params });

export default { getPorts };

import Gateway from '../gateway/gateway';

const getCallTypes = () => Gateway.get('/calltype');

const getPorts = ({ params }) => Gateway.get('/ports', { params });

const getAllNationality = () => Gateway.get('crew/get_all_nationality');

export default {
    getCallTypes,
    getAllNationality,
    getPorts,
};

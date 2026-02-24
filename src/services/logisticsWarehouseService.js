import Gateway from '../gateway/gateway';

const addLogisticsWarehouse = (data) => Gateway.post('/logistics/add_logistics_warehouse', data);
const getLogisticsWarehouses = ({ params }) => Gateway.get('/logistics/get_all_logistics_warehouse', { params });
const updateLogisticsWarehouse = (data) => Gateway.post(`/logistics/update_logistics_warehouse`, data);
const deleteLogisticsWarehouse = (id) => Gateway.delete(`/logistics/delete_logistics_warehouse/${id}`);

export default { addLogisticsWarehouse, getLogisticsWarehouses, updateLogisticsWarehouse, deleteLogisticsWarehouse };

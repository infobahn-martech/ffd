import Gateway from '../gateway/gateway';

const getOrderHistory = (type, typeId) => Gateway.get(`/material_management/get_order_history/${type}/${typeId}`);
const getAllOrdersSummary = (params) => Gateway.get('/material_management/get_all_orders_summary', { params });

export default { getOrderHistory, getAllOrdersSummary };

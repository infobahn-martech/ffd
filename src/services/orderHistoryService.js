import Gateway from '../gateway/gateway';

const getOrderHistory = (type, typeId) => Gateway.get(`/material_management/get_order_history/${type}/${typeId}`);

export default { getOrderHistory };

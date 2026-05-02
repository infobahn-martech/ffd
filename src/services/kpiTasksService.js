import Gateway from '../gateway/gateway';

const getAllKpiTasks = () => Gateway.get('/kpi/get_all_kpi_tasks');
const getOperatorKpi = (cardId) => Gateway.get(`/kpi/get_operator_kpi/${cardId}`);

const updateKpiPointTime = (data) => Gateway.post('/kpi/update_kpi', data);

export default { getAllKpiTasks, getOperatorKpi, updateKpiPointTime };

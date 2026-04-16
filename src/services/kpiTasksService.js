import Gateway from '../gateway/gateway';

const getAllKpiTasks = () => Gateway.get('/kpi/get_all_kpi_tasks');

const updateKpiPointTime = (data) => Gateway.post('/kpi/update_kpi_point_time', data);

export default { getAllKpiTasks, updateKpiPointTime };

import Gateway from '../gateway/gateway';

const getAllKpiLevels = () => Gateway.get('/kpi/get_all_kpi_levels');
const addKpiLevel = (formData) => Gateway.post('/kpi/add_kpi_level', formData);
const updateKpiLevel = (formData) => Gateway.post('/kpi/update_kpi_level', formData);

export default {
  getAllKpiLevels,
  addKpiLevel,
  updateKpiLevel,
};

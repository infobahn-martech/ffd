import Gateway from '../gateway/gateway';

const getAllKpiLevels = () => Gateway.get('/kpi/get_all_kpi_levels');
const getKpiLevel = (levelId) => Gateway.get(`/kpi/get_kpi_level/${levelId}`);
const addKpiLevel = (formData) => Gateway.post('/kpi/add_kpi_level', formData);
const updateKpiLevel = (formData) => Gateway.post('/kpi/update_kpi_level', formData);

export default {
  getAllKpiLevels,
  getKpiLevel,
  addKpiLevel,
  updateKpiLevel,
};

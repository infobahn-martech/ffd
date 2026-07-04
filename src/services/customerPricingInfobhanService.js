import Gateway from '../gateway/gateway';

const getAllServiceCodes = () => Gateway.get('/service/get_all_service_codes');

const savePricing = (payload) => Gateway.post('/billingentity/save_pricing', payload);

const getPricingByTariffId = (tariffId) =>
  Gateway.get(`/billingentity/get_pricing/${tariffId}`);

const updatePricing = (payload) => Gateway.post('/billingentity/update_pricing', payload);

export default {
  getAllServiceCodes,
  savePricing,
  getPricingByTariffId,
  updatePricing,
};

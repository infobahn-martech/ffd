import Gateway from '../gateway/gateway';

const getTriggerTypes = ({ params } = {}) =>
  Gateway.get('/business_rule/get_trigger_types', { params });

const getFields = ({ params } = {}) =>
  Gateway.get('/business_rule/get_fields', { params });

const getTimeUnits = ({ params } = {}) =>
  Gateway.get('/business_rule/get_time_units', { params });

export default { getTriggerTypes, getFields, getTimeUnits };

import Gateway from '../gateway/gateway';

const getTriggerTypes = ({ params } = {}) =>
  Gateway.get('/business_rule/get_trigger_types', { params });

const getFields = ({ params } = {}) =>
  Gateway.get('/business_rule/get_fields', { params });

const getTimeUnits = ({ params } = {}) =>
  Gateway.get('/business_rule/get_time_units', { params });

const getCustomFields = ({ params } = {}) =>
  Gateway.get('/business_rule/get_custom_fields', { params });

const getRegularFields = ({ params } = {}) =>
  Gateway.get('/business_rule/get_regular_fields', { params });

const getBusinessRules = ({ params } = {}) =>
  Gateway.get('/business_rule/get_business_rules', { params });

const getTriggerConfig = (triggerTypeId) =>
  Gateway.get(`/business_rule/get_trigger_config/${triggerTypeId}`);

const getBusinessRuleStats = () =>
  Gateway.get('/business_rule/get_business_rule_stats');

const getLinkCardPossibleActions = ({ params } = {}) =>
  Gateway.get('/business_rule/get_link_card_possible_actions', { params });

export default {
  getTriggerTypes, getFields, getTimeUnits, getCustomFields, getRegularFields, getBusinessRules, getTriggerConfig,
  getBusinessRuleStats, getLinkCardPossibleActions,
};

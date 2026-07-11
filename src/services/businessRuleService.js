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

const getThenActionFields = (actionTypeId, { params } = {}) =>
  Gateway.get(`/business_rule/get_then_action_fields/${actionTypeId}`, { params });

const getBusinessRules = ({ params } = {}) =>
  Gateway.get('/business_rule/get_business_rules', { params });

const getTriggerConfig = (triggerTypeId) =>
  Gateway.get(`/business_rule/get_trigger_config/${triggerTypeId}`);

const getBusinessRuleStats = () =>
  Gateway.get('/business_rule/get_business_rule_stats');

const getLinkCardPossibleActions = ({ params } = {}) =>
  Gateway.get('/business_rule/get_link_card_possible_actions', { params });

const getLinkCardPossibleActionOperators = ({ params } = {}) =>
  Gateway.get('/business_rule/get_link_card_possible_action_operators', { params });

const getFieldDetails = (fieldType, fieldId) =>
  Gateway.get(`/business_rule/get_field_details/${fieldType}/${fieldId}`);

const getNotificationSettings = (notificationId) =>
  Gateway.get(`/business_rule/get_notification_settings/${notificationId}`);

export default {
  getTriggerTypes, getFields, getTimeUnits, getCustomFields, getRegularFields, getThenActionFields, getBusinessRules, getTriggerConfig,
  getBusinessRuleStats, getLinkCardPossibleActions, getLinkCardPossibleActionOperators, getFieldDetails, getNotificationSettings,
};

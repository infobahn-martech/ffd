import Gateway from '../gateway/gateway';

const addBillingInstruction = (data) =>
  Gateway.post('/billingentity/add_billing_instruction', data);

const fetchAllBillingInstructions = ({ params }) =>
  Gateway.get('/billingentity/get_all_billing_instruction', { params });

const updateBillingInstruction = (data) =>
  Gateway.post('/billingentity/update_billing_instruction', data);

const fetchInstructionByEntity = (entity_id) =>
  Gateway.get(`/billingentity/get_instruction_by_entity/${entity_id}`);

export default {
  addBillingInstruction,
  fetchAllBillingInstructions,
  updateBillingInstruction,
  fetchInstructionByEntity,
};

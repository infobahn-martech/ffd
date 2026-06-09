import Gateway from '../gateway/gateway';

const addBillingInstruction = (data) =>
  Gateway.post('/billingentity/add_billing_instruction', data);

const fetchAllBillingInstructions = ({ params }) =>
  Gateway.get('/billingentity/get_all_billing_instruction', { params });

const updateBillingInstruction = (data) =>
  Gateway.post('/billingentity/update_billing_instruction', data);

const fetchInstructionByEntity = (entity_id) =>
  Gateway.get(`/billingentity/get_instruction_by_entity/${entity_id}`);

const addBillingInstructionEmail = (payload) =>
  Gateway.post('/billingentity/add_billing_instruction_email', payload);

const deleteBillingInstruction = (data) =>
  Gateway.post('/billingentity/delete_billing_instruction', data);

export default {
  addBillingInstruction,
  fetchAllBillingInstructions,
  updateBillingInstruction,
  fetchInstructionByEntity,
  addBillingInstructionEmail,
  deleteBillingInstruction,
};

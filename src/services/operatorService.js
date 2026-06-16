import Gateway from "../gateway/gateway";

const addOperator = (data) =>
  Gateway.post("/launch_hire/add_operator", data);

const getAllOperators = (params) =>
  Gateway.get("/launch_hire/get_all_operators", { params });

const getOperatorById = (operator_id) =>
  Gateway.post(`/launch_hire/get_operator_by_id/${operator_id}`, {
    operator_id,
  });

const updateOperator = (data) =>
  Gateway.post("/launch_hire/update_operator", data);

const deleteOperator = (operator_id) =>
  Gateway.delete(`/launch_hire/delete_operator/${operator_id}`);

export default {
  addOperator,
  getAllOperators,
  getOperatorById,
  updateOperator,
  deleteOperator,
};
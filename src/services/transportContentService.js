import Gateway from "../gateway/gateway";

const createTransportRequest = (formData) =>
  Gateway.post("/transport/create_transport_request", formData);

export default {
  createTransportRequest,
};

import Gateway from "../gateway/gateway";

const departureService = {
  getDepartureDetail: (callId) =>
    Gateway.get(`departure/get_departure_detail/${encodeURIComponent(String(callId))}`),
  saveDepartureDetail: (formData) =>
    Gateway.post("departure/save_departure_detail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default departureService;

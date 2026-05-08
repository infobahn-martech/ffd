import Gateway from "../gateway/gateway";

const arrivalService = {
  getArrivalDetail: (callId) =>
    Gateway.get(`arrival/get_arrival_detail/${encodeURIComponent(String(callId))}`),
  saveArrivalDetail: (formData) =>
    Gateway.post("arrival/save_arrival_detail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  sendReport: (payload) => Gateway.post("arrival/send_report", payload),
};

export default arrivalService;

import Gateway from "../gateway/gateway";

const preArrivalService = {
  getPreArrivalDetail: (callId) =>
    Gateway.get(`pre_arrival/get_prearrival_detail/${encodeURIComponent(String(callId))}`),

  savePreArrival: (formData) =>
    Gateway.post("pre_arrival/save_prearrival", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  sendPreArrivalReport: (payload) =>
    Gateway.post("pre_arrival/send_prearrival_report", payload),
};

export default preArrivalService;

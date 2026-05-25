import Gateway from "../gateway/gateway";

const preArrivalService = {
  getPreArrivalDetail: (callId) =>
    Gateway.get(`pre_arrival/get_prearrival_detail/${encodeURIComponent(String(callId))}`),

  savePreArrival: (formData) =>
    Gateway.post("pre_arrival/save_prearrival", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  sendPreArrivalReport: (payload) =>
    Gateway.post("arrival/send_report", payload),

  getChecklistItemsByRole: (payload) =>
    Gateway.post("pre_arrival/get_checklist_items_by_role", payload),
};

export default preArrivalService;

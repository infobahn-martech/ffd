import Gateway from "../gateway/gateway";

const arrivalService = {
  saveArrivalDetail: (formData) =>
    Gateway.post("arrival/save_arrival_detail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getDailyReport: (payload) => Gateway.post("arrival/get_daily_report", payload),
};

export default arrivalService;

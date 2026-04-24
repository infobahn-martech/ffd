import Gateway from "../gateway/gateway";

const preArrivalService = {
  savePreArrival: (formData) =>
    Gateway.post("pre_arrival/save_prearrival", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default preArrivalService;

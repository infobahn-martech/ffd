import Gateway from "../gateway/gateway";

const arrivalService = {
  saveArrivalDetail: (formData) =>
    Gateway.post("arrival/save_arrival_detail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default arrivalService;

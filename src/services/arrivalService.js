import Gateway from "../gateway/gateway";

const arrivalService = {
  getArrivalDetail: (callId) =>
    Gateway.get(`arrival/get_arrival_detail/${encodeURIComponent(String(callId))}`),
  saveArrivalDetail: (formData) =>
    Gateway.post("arrival/save_arrival_detail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  sendReport: (payload) => Gateway.post("arrival/send_report", payload),
  saveCallTimeObject: ({ call_id, stage_id, time_object }) =>
    Gateway.post("time_object/save_call_time_object", {
      call_id,
      stage_id,
      time_object,
    }),
  deleteCallTimeObject: ({ timeObjectId, callId, stageId }) =>
    Gateway.delete(
      `time_object/delete_call_time_object/${encodeURIComponent(
        String(timeObjectId)
      )}/${encodeURIComponent(String(callId))}`,
      { data: { stage_id: stageId } }
    ),
};

export default arrivalService;

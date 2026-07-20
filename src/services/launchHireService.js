import Gateway from "../gateway/gateway";

const addLaunchHireService = (data) =>
  Gateway.post("/launch_hire/add_launch_hire_service", data);

const getAllLaunchHireServices = (params) =>
  Gateway.get("/launch_hire/get_all_launchhire_service", { params });

const getLaunchHireServiceById = (service_id) =>
  Gateway.post(`/launch_hire/get_launchhire_service_by_id/${service_id}`, {
    service_id,
  });

const updateLaunchHireService = (data) =>
  Gateway.post("/launch_hire/update_launch_hire_service", data);

const deleteLaunchHireService = (service_id) =>
  Gateway.delete(`/launch_hire/delete_launch_hire_service/${service_id}`);

const getLaunchHireRequests = (callId) =>
  Gateway.get(`/launch_hire/get_launch_hire_requests/${encodeURIComponent(String(callId))}`);

// Placeholder — the standalone "request launch hire" (call/vessel +
// launch_datetime only) endpoint contract isn't finalized on the backend
// yet. Update the path once it's confirmed.
const createLaunchHireRequest = (payload) =>
  Gateway.post("/launch_hire/create_launch_hire_request", payload);

// Crew Immigration "Request Launch Hire" booking — { call_id, booking_datetime, batches }
const createCrewImmigrationBooking = (payload) =>
  Gateway.post("/launch_hire/create_crew_immigration_booking", payload);

export default {
  addLaunchHireService,
  getAllLaunchHireServices,
  getLaunchHireServiceById,
  updateLaunchHireService,
  deleteLaunchHireService,
  getLaunchHireRequests,
  createLaunchHireRequest,
  createCrewImmigrationBooking,
};

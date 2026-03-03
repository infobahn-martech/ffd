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

export default {
  addLaunchHireService,
  getAllLaunchHireServices,
  getLaunchHireServiceById,
  updateLaunchHireService,
};

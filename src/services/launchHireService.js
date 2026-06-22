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

export default {
  addLaunchHireService,
  getAllLaunchHireServices,
  getLaunchHireServiceById,
  updateLaunchHireService,
  deleteLaunchHireService,
};

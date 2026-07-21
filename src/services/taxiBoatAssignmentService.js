import Gateway from "../gateway/gateway";

const getFleetsByOperator = (operator_id) =>
  Gateway.get(`/launch_hire/get_fleet_by_operator/${operator_id}`);

const getCaptainsByTaxiBoat = (taxi_boat_id) =>
  Gateway.get(`/launch_hire/get_captain_by_taxiboat/${taxi_boat_id}`);

const assignCaptain = (payload) =>
  Gateway.post("/launch_hire/assign_captain", payload);

export default {
  getFleetsByOperator,
  getCaptainsByTaxiBoat,
  assignCaptain,
};

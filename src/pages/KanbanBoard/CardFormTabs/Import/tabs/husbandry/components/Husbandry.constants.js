// Constants
export const MAIN_TABS = {
  CREW_MANAGEMENT: "crewManagement",
  WAREHOUSE: "warehouse",
  ON_OFF_HIRE_SURVEY: "onOffHireSurvey",
  ON_STATION: "onStation",
  MATERIAL_MANAGEMENT: "materialManagement",
  WASTE_DISPOSAL: "wasteDisposal",
  MWP_RENEWAL: "mwpRenewal",
  THIRD_PARTY_SERVICES: "thirdPartyServices",
};

export const CREW_MANAGEMENT_SUBTABS = {
  CREW: "crew",
  TRANSPORT: "transport",
  CG_PASS: "cgPass",
  ZAWIL_PASS: "zawilPass",
  LAUNCH_HIRE: "launchHire",
  HOTEL: "hotel",
  MEDICAL_SERVICE: "medicalService",
};

export const MATERIAL_MANAGEMENT_SUBTABS = {
  INBOUND_ORDERS: "inboundOrders",
  LANDING_NOTE: "landingNote",
  DISPATCH_NOTE: "dispatchNote",
  ORDER_HISTORY: "orderHistory",
};

// Launch Hire - Trigger & Booking Interface
export const LAUNCH_HIRE_LOCATION_OPTIONS = [
  { value: "FREIGHTER_ANCHORAGE", label: "Freighter Anchorage" },
  { value: "RT7", label: "RT7" },
  { value: "SEA_ISLAND", label: "Sea Island" },
  { value: "JUAYMAH", label: "Juaymah" },
];

export const TRANSPORT_ROUTE_LOCATION_OPTIONS = [
  { value: "Dammam airport", label: "Dammam airport" },
  { value: "Dammam", label: "Dammam" },
  { value: "Khobar", label: "Khobar" },
  { value: "Dhahran", label: "Dhahran" },
  { value: "Rastanura", label: "Rastanura" },
  { value: "Jubail", label: "Jubail" },
  { value: "Abu Ali pier", label: "Abu Ali pier" },
  { value: "Ras Abu Ali", label: "Ras Abu Ali" },
  { value: "Manifa", label: "Manifa" },
  { value: "Tanajib", label: "Tanajib" },
  { value: "Safaniya", label: "Safaniya" },
  { value: "Ras Al Khair", label: "Ras Al Khair" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Tanajib pier", label: "Tanajib pier" },
  { value: "Safaniya pier", label: "Safaniya pier" },
  { value: "Khafji", label: "Khafji" },
  { value: "Abu Ali", label: "Abu Ali" },
  { value: "Shedgum", label: "Shedgum" },
  { value: "Mubarrz", label: "Mubarrz" },
  { value: "Manifa port", label: "Manifa port" },
];

export const LAUNCH_HIRE_SERVICE_TYPES = {
  CREW_CHANGE: "CREW_CHANGE",
  MATERIAL_DELIVERY: "MATERIAL_DELIVERY",
  CREW_CHANGE_MATERIAL_DELIVERY: "CREW_CHANGE_MATERIAL_DELIVERY",
  PROVISION_DELIVERY: "PROVISION_DELIVERY",
  PORT_CAPTAIN_ENGINEER_VISIT: "PORT_CAPTAIN_ENGINEER_VISIT",
  CUSTOM_INSPECTION: "CUSTOM_INSPECTION",
  IMMIGRATION_CLEARANCE: "IMMIGRATION_CLEARANCE",
  GARBAGE_COLLECTION: "GARBAGE_COLLECTION",
  TECHNICIAN_VISIT: "TECHNICIAN_VISIT",
  TANKER_CLEARANCE: "TANKER_CLEARANCE",
};

export const LAUNCH_HIRE_SERVICE_TYPE_OPTIONS = [
  { value: LAUNCH_HIRE_SERVICE_TYPES.CREW_CHANGE, label: "Crew Change" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.MATERIAL_DELIVERY, label: "Material Delivery" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.CREW_CHANGE_MATERIAL_DELIVERY, label: "Crew Change Material Delivery" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.PROVISION_DELIVERY, label: "Provision Delivery" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.PORT_CAPTAIN_ENGINEER_VISIT, label: "Port Captain & Port Engineer Visit" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.CUSTOM_INSPECTION, label: "Custom Inspection" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.IMMIGRATION_CLEARANCE, label: "Immigration Clearance" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.GARBAGE_COLLECTION, label: "Garbage Collection" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.TECHNICIAN_VISIT, label: "Technician Visit" },
  { value: LAUNCH_HIRE_SERVICE_TYPES.TANKER_CLEARANCE, label: "Tanker Clearance" },
];

// Service types that require a Packing List excel upload
export const LAUNCH_HIRE_PACKING_LIST_SERVICE_TYPES = [
  LAUNCH_HIRE_SERVICE_TYPES.MATERIAL_DELIVERY,
  LAUNCH_HIRE_SERVICE_TYPES.PROVISION_DELIVERY,
  LAUNCH_HIRE_SERVICE_TYPES.GARBAGE_COLLECTION,
  LAUNCH_HIRE_SERVICE_TYPES.CREW_CHANGE_MATERIAL_DELIVERY,
];

export const LAUNCH_HIRE_CREW_MOVEMENT_OPTIONS = [
  { value: "SIGN_ON", label: "Sign On" },
  { value: "SIGN_OFF", label: "Sign Off" },
];



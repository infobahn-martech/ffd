/**
 * Status Timeline steps for the Job window (see JobStatusTimeline.jsx). This is a
 * semantic operational-status field independent of the card's Kanban column —
 * NOT the same thing as the board's column-bound StepsProgress stepper in
 * CardForm.jsx.
 */
export const JOB_STATUS_STEPS = [
  { key: "pickup_request_sent", label: "Pickup Request Sent" },
  { key: "pickup_completed", label: "Pickup Completed" },
  { key: "cargo_received", label: "Cargo Received" },
  { key: "customs_clearance_started", label: "Customs Clearance Started" },
  { key: "customs_cleared", label: "Customs Cleared" },
  { key: "loaded", label: "Loaded" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "pod_uploaded", label: "POD Uploaded" },
  { key: "job_closed", label: "Job Closed" },
];

export const jobStatusStepIndex = (statusKey) =>
  JOB_STATUS_STEPS.findIndex((step) => step.key === statusKey);

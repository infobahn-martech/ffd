export const FOLDER_TREE = [
  {
    name: "Call File Open",
    children: [
      { name: "Appointment Email" },
      { name: "Invoice" },
      { name: "Documents" },
    ],
  },
  {
    name: "Pre Arrival",
    children: [
      { name: "Port Documents" },
      { name: "Crew Documents" },
    ],
  },
  {
    name: "Arrival",
    children: [
      { name: "Arrival Reports" },
      { name: "Custom Clearance" },
    ],
  },
  {
    name: "Departure",
    children: [
      { name: "Departure Reports" },
      { name: "Certificates" },
    ],
  },
  {
    name: "Checklist",
    children: [
      { name: "General Checklist" },
      { name: "Operation Checklist" },
    ],
  },
];

export const DOCUMENTS = [
  {
    id: 1,
    type: "pdf",
    folder: "Appointment Email",
    name: "2_IMP_Horizon_Client_Appointment_Email.pdf",
    size: "2.76 MB",
    uploadedBy: "Martech",
    date: "Jun 11, 2026",
  },
  {
    id: 2,
    type: "pdf",
    folder: "Appointment Email",
    name: "Invoice-BusinessCenter.pdf",
    size: "1.42 MB",
    uploadedBy: "Martech",
    date: "Jun 12, 2026",
  },
  {
    id: 3,
    type: "doc",
    folder: "Crew Documents",
    name: "Crew_Manifest.docx",
    size: "480 KB",
    uploadedBy: "Operations",
    date: "Jun 13, 2026",
  },
  {
    id: 4,
    type: "xls",
    folder: "Arrival Reports",
    name: "Arrival_Report.xlsx",
    size: "860 KB",
    uploadedBy: "Operations",
    date: "Jun 14, 2026",
  },
];

export const DEFAULT_FOLDER = "Appointment Email";
export const DEFAULT_PARENT_FOLDER = "Call File Open";
export const DEFAULT_DOCUMENT_ID = 1;

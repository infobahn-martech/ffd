import { enrichGroDocWithRowKey } from "../User/groCardUtils";

/** Static document rows for GRO Supervisor read-only library (until API is wired). */
const GRO_SUPERVISOR_STATIC_DOCUMENTS_RAW = [
  { document_name: "Registry", status: 2, file_name: "registry.pdf", file_url: "#" },
  { document_name: "Tonnage", status: 1, file_name: "tonnage.pdf", file_url: "#" },
  { document_name: "Ship Radio Station License", status: 0, file_name: null, file_url: null },
  { document_name: "Maritime Health Declaration", status: 3, file_name: "mhd.pdf", file_url: "#" },
  { document_name: "Sanitation Certificate", status: 2, file_name: "sanitation.pdf", file_url: "#" },
  { document_name: "Last Port clearance", status: 4, file_name: "lpc.pdf", file_url: "#" },
  { document_name: "Crew List", status: 1, file_name: "crew_list.xlsx", file_url: "#" },
  { document_name: "Immigration Batches", status: 0, file_name: null, file_url: null },
];

export const getGroSupervisorStaticDocuments = () =>
  GRO_SUPERVISOR_STATIC_DOCUMENTS_RAW.map((d, i) => enrichGroDocWithRowKey(d, i));

export const GRO_SUPERVISOR_DOC_STATUS_META = {
  0: { label: "Not uploaded", badgeClass: "gro-supervisor-doc-status--neutral" },
  1: { label: "Pending verification", badgeClass: "gro-supervisor-doc-status--warning" },
  2: { label: "Verified", badgeClass: "gro-supervisor-doc-status--success" },
  3: { label: "Reupload required", badgeClass: "gro-supervisor-doc-status--orange" },
  4: { label: "Rejected", badgeClass: "gro-supervisor-doc-status--danger" },
};

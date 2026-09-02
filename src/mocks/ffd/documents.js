/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * "Controlled documents" (Rate Request File / Quotation File / Costing File /
 * Delivery Note) generated from a job's data — see JobDocumentsPanel.jsx. These
 * are mock records only: metadata + a generated/approval lifecycle, not real
 * PDF/template output (no template engine exists anywhere in this codebase).
 *
 * `needs_manager_approval` follows the requirements doc's rule: margin < 15% or
 * sale amount > SR.5000 on a Quotation/Costing file requires manager approval
 * before it's usable — see generateDocument in src/mocks/ffd/index.js.
 */

export const DOCUMENT_TYPES = [
  { key: "rate_request", label: "Rate Request File" },
  { key: "quotation", label: "Quotation File" },
  { key: "costing", label: "Costing File" },
  { key: "delivery_note", label: "Delivery Note" },
];

let documentIdCounter = 1;
export const nextDocumentId = () => `doc-${documentIdCounter++}`;

/** Seed documents keyed by card_id, in the exact shape generateDocument() produces. */
export const documentsByCardId = {
  "comm-card-1": [
    {
      document_id: nextDocumentId(),
      card_id: "comm-card-1",
      board_id: "ffd-board-commercials",
      document_type: "rate_request",
      generated_at: "2026-08-20T09:15:00Z",
      fields: { rfq_number: "RFQ-1042", carriers: "DHL, FedEx, Aramex" },
      margin_percent: null,
      sale_amount: null,
      needs_manager_approval: false,
      approval_status: "none",
    },
  ],
  "ffd-card-4": [
    {
      document_id: nextDocumentId(),
      card_id: "ffd-card-4",
      board_id: "ffd-board-ops",
      document_type: "quotation",
      generated_at: "2026-08-25T11:30:00Z",
      fields: { job_number: "SED-SEA-0124", quotation_number: "QUO-1039" },
      margin_percent: 9,
      sale_amount: 6200,
      needs_manager_approval: true,
      approval_status: "pending",
    },
  ],
  "bill-card-3": [
    {
      document_id: nextDocumentId(),
      card_id: "bill-card-3",
      board_id: "ffd-board-billing",
      document_type: "delivery_note",
      generated_at: "2026-08-15T18:20:00Z",
      fields: { job_number: "SED-AIR-0098" },
      margin_percent: null,
      sale_amount: null,
      needs_manager_approval: false,
      approval_status: "none",
    },
  ],
};

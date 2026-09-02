/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * Board/workflow/stage/column skeletons in the exact raw shape one element of
 * `kanban_board/get_full_board/{board_id}` returns (see mapBoardWorkflowFromApi
 * in src/shared/helpers/data.js). `cards_by_swimlane` is filled in by
 * src/mocks/ffd/index.js from cards.js — this file only defines board structure.
 *
 * Each column is its own stage so it gets a distinct header color, purely for
 * visual review (stage color is the only thing that drives column color).
 */

/** One stage wrapping exactly one column — gives each column its own header color. */
const singleColumnStage = (id, name, colorCode) => ({
  stage_id: `stage-${id}`,
  stage_name: name,
  color_code: colorCode,
  columns: [
    {
      column_id: id,
      column_name: name,
      cards_per_row: 2,
      background_color: "#ffffff",
      cards_by_swimlane: {},
    },
  ],
});

const defaultSwimlane = [
  { swimlane_id: "default", swimlane_name: "Default", color_code: "#ffffff", swimlane_order: 1 },
];

/** Operations board is split into Priority / Non Priority swimlanes. */
const priorityNonPrioritySwimlanes = [
  { swimlane_id: "priority", swimlane_name: "Priority", color_code: "#ffffff", swimlane_order: 1 },
  { swimlane_id: "non-priority", swimlane_name: "Non Priority", color_code: "#ffffff", swimlane_order: 2 },
];

/** board_id -> array of raw workflow objects (one board can have multiple workflows/accordions). */
export const mockBoardStructures = {
  "ffd-board-commercials": [
    {
      workflow_id: "ffd-wf-commercials",
      workflow_name: "FFD Commercials",
      role_id: null,
      description: "RFQ through won/cancelled commercial pipeline",
      board_id: "ffd-board-commercials",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("col-rfq", "RFQ", "#7c3aed"),
        singleColumnStage("col-rates-requested", "Rates Requested", "#b45309"),
        singleColumnStage("col-quoted-comm", "Quoted", "#16a34a"),
        singleColumnStage("col-won", "Won", "#ea580c"),
        singleColumnStage("col-cancelled-comm", "Cancelled", "#dc2626"),
      ],
      swimlanes: defaultSwimlane,
    },
  ],
  "ffd-board-ops": [
    {
      workflow_id: "ffd-wf-ops",
      workflow_name: "FFD Operations Board",
      role_id: null,
      description: "Quoted-basis and contractual operations through to costing",
      board_id: "ffd-board-ops",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("col-ops-quoted", "Operations (Quoted Basis)", "#7c3aed"),
        singleColumnStage("col-ops-contractual", "Operations (Contractual)", "#b45309"),
        singleColumnStage("col-ops-completed", "Completed (Costing Issuance)", "#16a34a"),
        singleColumnStage("col-ops-costing-issued", "Costing Issued", "#ea580c"),
        singleColumnStage("col-ops-cancelled", "Cancelled", "#dc2626"),
      ],
      swimlanes: priorityNonPrioritySwimlanes,
    },
  ],
  "ffd-board-billing": [
    {
      workflow_id: "ffd-wf-billing",
      workflow_name: "FFD Billing Board",
      role_id: null,
      description: "Costing through invoicing and archival",
      board_id: "ffd-board-billing",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("col-billing-costing-issued", "Costing Issued", "#b45309"),
        singleColumnStage("col-billing-invoice-issued", "Invoice Issued", "#16a34a"),
        singleColumnStage("col-billing-invoice-submitted", "Invoice Submitted", "#0f2a3d"),
        singleColumnStage("col-billing-job-completed", "Job Completed", "#0f2a3d"),
        singleColumnStage("col-billing-ready-archive", "Ready to Archive", "#0f2a3d"),
      ],
      swimlanes: defaultSwimlane,
    },
  ],
  "ffd-board-customs": [
    {
      workflow_id: "ffd-wf-customs",
      workflow_name: "FFD Customs Clearance",
      role_id: null,
      description: "Import/export customs clearance pipeline",
      board_id: "ffd-board-customs",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("col-customs-docs-received", "Documents Received", "#7c3aed"),
        singleColumnStage("col-customs-under-review", "Under Review", "#b45309"),
        singleColumnStage("col-customs-duty-assessment", "Duty Assessment", "#0d9488"),
        singleColumnStage("col-customs-cleared", "Cleared", "#16a34a"),
        singleColumnStage("col-customs-held", "Held / Query", "#dc2626"),
      ],
      swimlanes: defaultSwimlane,
    },
  ],
  "ffd-board-service": [
    {
      workflow_id: "ffd-wf-service",
      workflow_name: "Service Requests",
      role_id: null,
      description: "Service request triage workflow",
      board_id: "ffd-board-service",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("svc-col-new", "New", "#2666be"),
        singleColumnStage("svc-col-progress", "In Progress", "#f59e0b"),
        singleColumnStage("svc-col-done", "Done", "#22c55e"),
      ],
      swimlanes: defaultSwimlane,
    },
  ],
};

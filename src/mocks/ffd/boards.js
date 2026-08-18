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
      cards_per_row: 1,
      background_color: "#ffffff",
      cards_by_swimlane: {},
    },
  ],
});

const defaultSwimlane = [
  { swimlane_id: "default", swimlane_name: "Default", color_code: "#ffffff", swimlane_order: 1 },
];

/** board_id -> array of raw workflow objects (one board can have multiple workflows/accordions). */
export const mockBoardStructures = {
  "ffd-board-ops": [
    {
      workflow_id: "ffd-wf-ops",
      workflow_name: "FFD Operations Board",
      role_id: null,
      description: "Primary operations workflow",
      board_id: "ffd-board-ops",
      is_pinned: false,
      is_collapsed: false,
      stages: [
        singleColumnStage("col-new", "New", "#2666be"),
        singleColumnStage("col-assigned", "Assigned", "#7c3aed"),
        singleColumnStage("col-in-progress", "In Progress", "#f59e0b"),
        singleColumnStage("col-review", "Review", "#0d9488"),
        singleColumnStage("col-completed", "Completed", "#22c55e"),
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

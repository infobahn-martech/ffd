/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * Raw shape of `kanban_workspace/list_all_workspace`'s response.data.data —
 * see transformWorkspaces() in src/pages/Workspaces/index.jsx for the fields
 * the UI actually reads (workspace_id, workspace_name, workspace_status,
 * background, boards[].{board_id,board_name,board_status,total_cards,background}).
 * There is no "description" field in the real workspace shape, so none is added
 * here — it would never be rendered.
 */

export const mockWorkspaces = [
  {
    workspace_id: "ffd-ws-operations",
    workspace_name: "Operations",
    workspace_status: "1",
    background: null,
    boards: [
      {
        board_id: "ffd-board-commercials",
        board_name: "FFD Commercials",
        board_status: "1",
        total_cards: 7,
        background: null,
      },
      {
        board_id: "ffd-board-ops",
        board_name: "FFD Operations Board",
        board_status: "1",
        total_cards: 12,
        background: null,
      },
      {
        board_id: "ffd-board-billing",
        board_name: "FFD Billing Board",
        board_status: "1",
        total_cards: 7,
        background: null,
      },
      {
        board_id: "ffd-board-customs",
        board_name: "FFD Customs Clearance",
        board_status: "1",
        total_cards: 5,
        background: null,
      },
    ],
  },
  {
    workspace_id: "ffd-ws-service",
    workspace_name: "Service Management",
    workspace_status: "1",
    background: null,
    boards: [
      {
        board_id: "ffd-board-service",
        board_name: "Service Requests",
        board_status: "1",
        total_cards: 6,
        background: null,
      },
    ],
  },
  {
    workspace_id: "ffd-ws-internal",
    workspace_name: "Internal Tasks",
    workspace_status: "1",
    background: null,
    boards: [],
  },
];

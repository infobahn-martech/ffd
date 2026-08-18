/**
 * ============================================================================
 * TEMPORARY DEV-ONLY MOCK DATA LAYER — remove this whole `src/mocks/ffd/`
 * folder, and the small conditional in the 4 files listed below, once the FFD
 * backend is available. Nothing here is used in production; it exists purely
 * so the generic Kanban UI can be reviewed before the real API exists.
 *
 * Enabled by `VITE_USE_MOCK_DATA=true` in .env (see .env.example). This is the
 * ONLY place that flag is read — every consumer below just gets a real-shaped
 * service object back, so nothing else in the app needs to know mock mode
 * exists. Wired into (search for `isMockDataEnabled` to find every touch point):
 *   - src/services/workSpaceService.js
 *   - src/services/kanbanBoardService.js
 *   - src/services/workflowService.js
 *   - src/pages/Authentication/index.jsx (login bypass — see mockUserProfile)
 *
 * Data flows through the exact same path real data will:
 *   mock service (this file, shaped like axios `{ data }`)
 *     -> kanbanBoardApiMapper.js / data.js (mapBoardWorkflowFromApi)
 *     -> useKanbanBoardState.js
 *     -> KanbanBoardPage.jsx
 *     -> generic Column / SwimlaneColumnCell / CardItem components
 * No board- or card-specific components were created for this — see
 * src/mocks/ffd/{workspaces,boards,cards,cardMeta}.js for the seed data only.
 * ============================================================================
 */

import { mockWorkspaces } from "./workspaces";
import { mockBoardStructures } from "./boards";
import { opsBoardCardsByColumn, serviceBoardCardsByColumn } from "./cards";
import { mockCardTypes, mockCardTags, mockCardBlockers, mockCardStickers } from "./cardMeta";

export const isMockDataEnabled = import.meta.env.VITE_USE_MOCK_DATA === "true";

/** Mock profile used to bypass real login while mock mode is on — see Authentication/index.jsx. */
export const mockUserProfile = {
  userid: "ffd-mock-user",
  name: "FFD Demo User",
  email: "demo@ffd.local",
  status: "active",
  role: { role_id: "1", role_name: "Super Admin" },
  // Grants exactly the module/actions the Workspaces + Edit Workflow screens check
  // (see src/shared/constants/permissions.js) — not a blanket allow-all.
  permissions: {
    sections: [
      {
        module_key: "KANBAN_WORKSPACE",
        actions: [
          { action_key: "VIEW_WORKSPACE" },
          { action_key: "CREATE_WORKSPACE" },
          { action_key: "RENAME_WORKSPACE" },
          { action_key: "ARCHIVE_WORKSPACE" },
          { action_key: "ADD_BOARD" },
          { action_key: "RENAME_BOARD" },
          { action_key: "ARCHIVE_BOARD" },
          { action_key: "UPDATE_BOARD_BACKGROUND" },
        ],
        sub_modules: [],
      },
      {
        module_key: "KANBAN_WORKFLOW",
        actions: [{ action_key: "VIEW_WORKFLOW" }],
        sub_modules: [],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// In-memory mutable state, seeded fresh on every full page load. Card
// type/tag/blocker/sticker/color/title edits made through CardForm persist
// here for the session so a board refetch (e.g. on closing the card modal)
// shows the change, the same way a real backend would.
// ---------------------------------------------------------------------------

const clone = (value) => JSON.parse(JSON.stringify(value));

const seedBoardCards = () => {
  const boards = clone(mockBoardStructures);
  const fill = (boardId, cardsByColumn) => {
    for (const workflow of boards[boardId] ?? []) {
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          const cards = cardsByColumn[col.column_id] ?? [];
          col.cards_by_swimlane = { default: clone(cards) };
        }
      }
    }
  };
  fill("ffd-board-ops", opsBoardCardsByColumn);
  fill("ffd-board-service", serviceBoardCardsByColumn);
  return boards;
};

let workspacesState = clone(mockWorkspaces);
let boardsState = seedBoardCards();

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (body = {}) => delay().then(() => ({ data: { status: "success", ...body } }));

function findCardById(cardId) {
  for (const boardId of Object.keys(boardsState)) {
    for (const workflow of boardsState[boardId]) {
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          for (const laneId of Object.keys(col.cards_by_swimlane ?? {})) {
            const card = col.cards_by_swimlane[laneId].find(
              (c) => String(c.card_id) === String(cardId)
            );
            if (card) return card;
          }
        }
      }
    }
  }
  return null;
}

function findWorkspaceAndBoard(boardId) {
  for (const ws of workspacesState) {
    const board = (ws.boards || []).find((b) => String(b.board_id) === String(boardId));
    if (board) return { workspace: ws, board };
  }
  return { workspace: null, board: null };
}

let mockIdCounter = 1;
const nextMockId = (prefix) => `${prefix}-${mockIdCounter++}`;

// ---------------------------------------------------------------------------
// Mock services — same function names/signatures as the real service modules
// they replace, so every caller (stores, components) is unchanged.
// ---------------------------------------------------------------------------

export const mockWorkSpaceService = {
  listAllWorkspaces: () => ok({ data: workspacesState }),

  createWorkspace: ({ workspace_name, board_name }) => {
    const id = nextMockId("ffd-ws");
    workspacesState = [
      ...workspacesState,
      {
        workspace_id: id,
        workspace_name: workspace_name || "Untitled workspace",
        workspace_status: "1",
        background: null,
        boards: board_name
          ? [{ board_id: nextMockId("ffd-board"), board_name, board_status: "1", total_cards: 0, background: null }]
          : [],
      },
    ];
    return ok({ message: "Workspace created successfully" });
  },

  renameWorkspace: (workspaceId, { workspace_name }) => {
    workspacesState = workspacesState.map((w) =>
      String(w.workspace_id) === String(workspaceId) ? { ...w, workspace_name } : w
    );
    return ok({ message: "Workspace renamed successfully" });
  },

  archiveWorkspace: (workspaceId) => {
    workspacesState = workspacesState.filter((w) => String(w.workspace_id) !== String(workspaceId));
    return ok({ message: "Workspace archived successfully" });
  },

  getWorkspaceArchiveLog: () => ok({ data: [] }),

  unarchiveWorkspace: () => ok({ message: "Nothing to restore in mock mode." }),

  createBoard: ({ workspace_id, board_name }) => {
    const boardId = nextMockId("ffd-board");
    workspacesState = workspacesState.map((w) =>
      String(w.workspace_id) === String(workspace_id)
        ? {
            ...w,
            boards: [
              ...(w.boards || []),
              { board_id: boardId, board_name: board_name || "Untitled board", board_status: "1", total_cards: 0, background: null },
            ],
          }
        : w
    );
    boardsState[boardId] = []; // renders via the existing "No workflows to display" empty state
    return ok({ message: "Board created successfully" });
  },

  renameBoard: (boardId, { board_name }) => {
    workspacesState = workspacesState.map((w) => ({
      ...w,
      boards: (w.boards || []).map((b) =>
        String(b.board_id) === String(boardId) ? { ...b, board_name } : b
      ),
    }));
    return ok({ message: "Board renamed successfully" });
  },

  archiveBoard: (boardId) => {
    workspacesState = workspacesState.map((w) => ({
      ...w,
      boards: (w.boards || []).filter((b) => String(b.board_id) !== String(boardId)),
    }));
    return ok({ message: "Board archived successfully" });
  },

  changeBoardBackground: (boardId, data) => {
    const { board } = findWorkspaceAndBoard(boardId);
    if (board && !(typeof FormData !== "undefined" && data instanceof FormData)) {
      board.background = { type: data.background_type, color: data.color };
    }
    return ok({ message: "Background updated" });
  },

  removeBoardBackground: (boardId) => {
    const { board } = findWorkspaceAndBoard(boardId);
    if (board) board.background = null;
    return ok({ message: "Background removed" });
  },
};

export const mockKanbanBoardService = {
  getFullBoard: (boardId) => delay().then(() => ({ data: boardsState[String(boardId)] ?? [] })),

  getCardTypesByBoard: () => ok({ card_types: mockCardTypes }),
  getCardTagsByBoard: () => ok({ card_tags: mockCardTags }),
  getCardBlockersByBoard: () => ok({ card_blockers: mockCardBlockers }),
  getCardStickersByBoard: () => ok({ card_stickers: mockCardStickers }),

  updateCardType: ({ card_id, card_type_id }) => {
    const card = findCardById(card_id);
    const row = mockCardTypes.find((t) => String(t.card_type_id) === String(card_type_id));
    if (card && row) {
      card.card_type_id = row.card_type_id;
      card.card_type_name = row.type_name;
      card.card_type_color = row.color_code;
      card.card_type_icon = row.icon_name;
    }
    return ok({ message: "Card type updated." });
  },

  updateCardTag: ({ card_id, card_tag_id }) => {
    const card = findCardById(card_id);
    if (card) card.card_tag_id = card_tag_id;
    return ok({ message: "Card tag updated." });
  },

  updateCardBlocker: ({ card_id, card_blocker_id }) => {
    const card = findCardById(card_id);
    const row = mockCardBlockers.find((b) => String(b.card_blocker_id) === String(card_blocker_id));
    if (card && row) {
      card.card_blocker_id = row.card_blocker_id;
      card.blocker_name = row.blocker_name;
      card.blocker_color = row.color_code;
      card.blocker_icon = row.icon_name;
    }
    return ok({ message: "Card blocker updated." });
  },

  updateCardSticker: ({ card_id, card_sticker_id }) => {
    const card = findCardById(card_id);
    const row = mockCardStickers.find((s) => String(s.card_sticker_id) === String(card_sticker_id));
    if (card && row) {
      card.card_sticker_id = row.card_sticker_id;
      card.sticker_name = row.sticker_name;
      card.sticker_color = row.color_code;
      card.sticker_icon = row.icon_name;
    }
    return ok({ message: "Card sticker updated." });
  },

  removeCardManagementItem: ({ card_id, manage_type }) => {
    const card = findCardById(card_id);
    if (card) {
      if (manage_type === "card_type") {
        card.card_type_id = null; card.card_type_name = null; card.card_type_color = null; card.card_type_icon = null;
      } else if (manage_type === "card_tag") {
        card.card_tag_id = null;
      } else if (manage_type === "card_blocker") {
        card.card_blocker_id = null; card.blocker_name = null; card.blocker_color = null; card.blocker_icon = null;
      } else if (manage_type === "card_sticker") {
        card.card_sticker_id = null; card.sticker_name = null; card.sticker_color = null; card.sticker_icon = null;
      }
    }
    return ok({ message: "Removed." });
  },

  updateCardColor: ({ card_id, card_color }) => {
    const card = findCardById(card_id);
    if (card) card.card_color = card_color;
    return ok({ message: "Card color updated." });
  },

  updateCardTitle: ({ card_id, title }) => {
    const card = findCardById(card_id);
    if (card) card.card_name = title;
    return ok({ message: "Card title updated." });
  },
};

export const mockWorkflowService = {
  toggleCollapseWorkflow: () => ok(),
  togglePinWorkflow: () => ok(),
};

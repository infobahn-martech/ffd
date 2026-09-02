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
import {
  commercialsBoardCardsByColumn,
  opsBoardCardsByColumn,
  billingBoardCardsByColumn,
  customsBoardCardsByColumn,
  serviceBoardCardsByColumn,
} from "./cards";
import { mockCardTypes, mockCardTags, mockCardBlockers, mockCardStickers } from "./cardMeta";
import { jobDetailsByCardId } from "./jobDetails";
import { documentsByCardId, nextDocumentId, DOCUMENT_TYPES } from "./documents";

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
      // FFD's four modules (see src/shared/constants/permissions.js) — the mock
      // Super Admin gets every action so the sidebar and boards stay fully visible.
      ...["COMMERCIAL_PRICING", "OPERATIONS_MODULE", "CUSTOMS_CLEARANCE", "BILLING_DESK"].map(
        (module_key) => ({
          module_key,
          actions: ["VIEW", "CREATE", "EDIT", "APPROVE"].map((action_key) => ({ action_key })),
          sub_modules: [],
        })
      ),
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

/** Merges jobDetailsByCardId onto matching card rows in place (mutates `cards`, an array). */
const applyJobDetails = (cards) => {
  for (const card of cards) {
    const job = jobDetailsByCardId[card.card_id];
    if (job) card.job = job;
  }
};

const seedBoardCards = () => {
  const boards = clone(mockBoardStructures);
  /** Entry per column is either a flat array (single "default" swimlane) or an
   *  object already keyed by swimlane id (multi-swimlane boards, e.g. Operations). */
  const fill = (boardId, cardsByColumn) => {
    for (const workflow of boards[boardId] ?? []) {
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          const entry = cardsByColumn[col.column_id];
          col.cards_by_swimlane = Array.isArray(entry)
            ? { default: clone(entry) }
            : clone(entry ?? {});
          for (const cards of Object.values(col.cards_by_swimlane)) {
            applyJobDetails(cards);
          }
        }
      }
    }
  };
  fill("ffd-board-commercials", commercialsBoardCardsByColumn);
  fill("ffd-board-ops", opsBoardCardsByColumn);
  fill("ffd-board-billing", billingBoardCardsByColumn);
  fill("ffd-board-customs", customsBoardCardsByColumn);
  fill("ffd-board-service", serviceBoardCardsByColumn);
  return boards;
};

let workspacesState = clone(mockWorkspaces);
let boardsState = seedBoardCards();
let documentsState = clone(documentsByCardId);

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (body = {}) => delay().then(() => ({ data: { status: "success", ...body } }));

/** @returns {{ card: object, boardId: string } | null} */
function findCardWithBoard(cardId) {
  for (const boardId of Object.keys(boardsState)) {
    for (const workflow of boardsState[boardId]) {
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          for (const laneId of Object.keys(col.cards_by_swimlane ?? {})) {
            const card = col.cards_by_swimlane[laneId].find(
              (c) => String(c.card_id) === String(cardId)
            );
            if (card) return { card, boardId };
          }
        }
      }
    }
  }
  return null;
}

function findCardById(cardId) {
  return findCardWithBoard(cardId)?.card ?? null;
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

/**
 * Human-facing RFQ/Quotation/Job numbers (distinct from the internal `nextMockId` ids
 * above). Job numbers are mode-suffixed and sequential per mode, e.g. "SED-SEA-0123" —
 * RFQ/Quotation numbers are a flat sequence, e.g. "RFQ-1043"/"QUO-1043", matching the
 * pre-existing placeholder style already used in the Dashboard's mock data.
 */
const numberCounters = { RFQ: 1043, QUO: 1043, JOB: {} };

/** @param {"RFQ"|"QUO"} kind */
const nextFlatNumber = (kind) => `${kind}-${numberCounters[kind]++}`;

/** @param {string} mode e.g. "AIR" | "SEA" | "LAND" */
const nextJobNumber = (mode) => {
  const key = String(mode || "GEN").toUpperCase();
  const n = (numberCounters.JOB[key] ?? 100) + 1;
  numberCounters.JOB[key] = n;
  return `SED-${key}-${String(n).padStart(4, "0")}`;
};

/**
 * Coarse status bucket for a column, reused by the Dashboard's status badges/
 * charts (see JOB_STATUS_COLORS in src/pages/Dashboard/index.jsx: Pending-Yellow,
 * In Progress-Blue, Completed-Green, Delayed-Red). Derived from the column's
 * position/title rather than tracked separately, since every board's columns
 * already encode this progression (first column = pending, a "cancel"/"held"
 * column = delayed, a "complet/won/deliver/archive/cleared/done/closed" column =
 * completed, anything else = in progress).
 */
function bucketColumnStatus(column, columnOrder, colKey) {
  const title = String(column?.title || "").toLowerCase();
  if (/cancel|held|query/.test(title)) return "delayed";
  if (/complet|won|deliver|archive|cleared|done|closed/.test(title)) return "completed";
  return columnOrder.indexOf(colKey) === 0 ? "pending" : "in_progress";
}

/**
 * Flattens every board's cards into row objects for the Dashboard's Inquiry & Job
 * table / stat widgets — the same underlying state the Kanban boards render, so
 * a Dashboard row's board_id/card_id always resolves to a real card (drill-down).
 * Cards with Job-window data (see jobDetails.js) surface richer fields (mode,
 * type, cargo, route); cards without it fall back to their raw display fields.
 */
export function getAllCardsFlat() {
  const rows = [];
  for (const boardId of Object.keys(boardsState)) {
    for (const workflow of boardsState[boardId]) {
      const columnOrder = (workflow.stages ?? []).flatMap((stage) =>
        (stage.columns ?? []).map((col) => String(col.column_id))
      );
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          const colKey = String(col.column_id);
          for (const laneId of Object.keys(col.cards_by_swimlane ?? {})) {
            for (const card of col.cards_by_swimlane[laneId]) {
              const job = card.job;
              const route =
                job?.pickup?.location && job?.delivery?.location
                  ? `${job.pickup.location} → ${job.delivery.location}`
                  : "";
              rows.push({
                board_id: boardId,
                card_id: card.card_id,
                workflow_id: workflow.workflow_id,
                id: job?.numbers?.job_number || job?.numbers?.rfq_number || card.card_id,
                customer: card.billing_entity || job?.header?.client_name || card.username || "",
                mode: job?.header?.mode_of_shipment || "",
                type: job?.header?.type || "",
                cargo: job?.cargo?.description || card.card_name || "",
                route,
                status: bucketColumnStatus(col, columnOrder, colKey),
                assigned_to: card.username || "",
                column_title: col.column_name,
                workflow_name: workflow.workflow_name,
              });
            }
          }
        }
      }
    }
  }
  return rows;
}

/**
 * Documents awaiting manager approval (margin < 15% or sale > SR.5000 — see
 * generateDocument below), for the Dashboard's Pending Approvals panel.
 */
export function getPendingApprovals() {
  const rows = [];
  for (const cardId of Object.keys(documentsState)) {
    for (const doc of documentsState[cardId]) {
      if (doc.approval_status !== "pending") continue;
      const typeLabel = DOCUMENT_TYPES.find((t) => t.key === doc.document_type)?.label ?? doc.document_type;
      const card = findCardById(cardId);
      rows.push({
        document_id: doc.document_id,
        card_id: cardId,
        board_id: doc.board_id,
        label: `${typeLabel} approval — ${card?.card_name || cardId} (margin ${doc.margin_percent ?? "—"}%)`,
      });
    }
  }
  return rows;
}

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

  updateJobDetails: ({ card_id, section, fields }) => {
    const card = findCardById(card_id);
    if (card && section) {
      card.job = card.job || {};
      card.job[section] = { ...(card.job[section] || {}), ...fields };
    }
    return ok({ message: "Job details updated." });
  },

  /**
   * Creates a new card on the given board/column/swimlane — used by the Dashboard's
   * "New Inquiry"/"Create a Job" quick actions (see src/pages/Dashboard/index.jsx).
   * `number_kind: "RFQ"` generates job.numbers.rfq_number; `"JOB"` generates
   * job.numbers.job_number (mode-suffixed, e.g. "SED-AIR-0123" — pass `mode`).
   */
  createCard: ({ board_id, column_id, swimlane_id, card_name, number_kind, mode, job }) => {
    const workflows = boardsState[String(board_id)] || [];
    let targetCol = null;
    findCol: for (const workflow of workflows) {
      for (const stage of workflow.stages ?? []) {
        for (const col of stage.columns ?? []) {
          if (column_id == null || String(col.column_id) === String(column_id)) {
            targetCol = col;
            break findCol;
          }
        }
      }
    }
    if (!targetCol) {
      return ok({ status: "error", message: "Board or column not found." });
    }
    targetCol.cards_by_swimlane = targetCol.cards_by_swimlane || {};
    const laneId = swimlane_id || Object.keys(targetCol.cards_by_swimlane)[0] || "default";
    targetCol.cards_by_swimlane[laneId] = targetCol.cards_by_swimlane[laneId] || [];
    const cardId = nextMockId("card");

    const generatedNumbers = {};
    if (number_kind === "RFQ") generatedNumbers.rfq_number = nextFlatNumber("RFQ");
    if (number_kind === "JOB") generatedNumbers.job_number = nextJobNumber(mode);
    const hasGeneratedNumbers = Object.keys(generatedNumbers).length > 0;
    const mergedJob = hasGeneratedNumbers
      ? { ...(job || {}), numbers: { ...(job?.numbers || {}), ...generatedNumbers } }
      : job;

    targetCol.cards_by_swimlane[laneId].push({
      card_id: cardId,
      card_name: card_name || "Untitled",
      ...(mergedJob ? { job: mergedJob } : {}),
    });
    return ok({
      message: "Card created.",
      data: { card_id: cardId, board_id: String(board_id), ...generatedNumbers },
    });
  },

  listDocumentsForCard: (cardId) => ok({ data: documentsState[String(cardId)] ?? [] }),

  /**
   * Generates a controlled document for a card. `needs_manager_approval` follows
   * the requirements doc's rule for Quotation/Costing files: margin < 15% or sale
   * amount > SR.5000 requires manager sign-off before the document is usable.
   */
  generateDocument: ({ card_id, document_type, margin_percent, sale_amount, fields }) => {
    const found = findCardWithBoard(card_id);
    if (!found) return ok({ status: "error", message: "Card not found." });

    const subjectToApproval = document_type === "quotation" || document_type === "costing";
    const needsApproval =
      subjectToApproval &&
      ((margin_percent != null && margin_percent < 15) || (sale_amount != null && sale_amount > 5000));

    const doc = {
      document_id: nextDocumentId(),
      card_id: String(card_id),
      board_id: found.boardId,
      document_type,
      generated_at: new Date().toISOString(),
      fields: fields || {},
      margin_percent: margin_percent ?? null,
      sale_amount: sale_amount ?? null,
      needs_manager_approval: needsApproval,
      approval_status: needsApproval ? "pending" : subjectToApproval ? "approved" : "none",
    };

    documentsState[String(card_id)] = [...(documentsState[String(card_id)] || []), doc];
    return ok({ message: "Document generated.", data: doc });
  },

  approveDocument: ({ document_id }) => {
    for (const cardId of Object.keys(documentsState)) {
      const doc = documentsState[cardId].find((d) => String(d.document_id) === String(document_id));
      if (doc) {
        doc.approval_status = "approved";
        doc.needs_manager_approval = false;
        break;
      }
    }
    return ok({ message: "Document approved." });
  },
};

export const mockWorkflowService = {
  toggleCollapseWorkflow: () => ok(),
  togglePinWorkflow: () => ok(),
};

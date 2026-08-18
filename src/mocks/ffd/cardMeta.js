/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * Card type / tag / blocker / sticker option lists, in the exact raw shape
 * `kanban_card/{get_card_types_by_board,get_card_tags_by_board,...}` return
 * (rows normalized by CardForm's BOARD_META_PICKERS — see normalizeBoardCardTypeRow
 * etc. in src/pages/KanbanBoard/components/cards/components/shared/CardForm.jsx).
 * Icon names are literal react-icons/fi export names (resolved by DynamicIcon.jsx).
 */

export const mockCardTypes = [
  { card_type_id: "type-task", type_name: "Task", color_code: "#2563eb", icon_name: "FiCheckSquare" },
  { card_type_id: "type-request", type_name: "Request", color_code: "#7c3aed", icon_name: "FiInbox" },
  { card_type_id: "type-review", type_name: "Review", color_code: "#0d9488", icon_name: "FiEye" },
  { card_type_id: "type-field", type_name: "Field Work", color_code: "#f59e0b", icon_name: "FiMapPin" },
];

export const mockCardTags = [
  { card_tag_id: "tag-urgent", tag_name: "Urgent", color_code: "#dc2626" },
  { card_tag_id: "tag-followup", tag_name: "Follow-up", color_code: "#f59e0b" },
  { card_tag_id: "tag-docs", tag_name: "Documentation", color_code: "#0ea5e9" },
  { card_tag_id: "tag-internal", tag_name: "Internal", color_code: "#64748b" },
];

export const mockCardBlockers = [
  { card_blocker_id: "blocker-client", blocker_name: "Waiting on client", color_code: "#dc3545", icon_name: "FiClock" },
  { card_blocker_id: "blocker-approval", blocker_name: "Pending approval", color_code: "#dc3545", icon_name: "FiAlertTriangle" },
];

export const mockCardStickers = [
  { card_sticker_id: "sticker-needs-check", sticker_name: "Needs check", color_code: "#f59e0b", icon_name: "FiFlag" },
  { card_sticker_id: "sticker-approved", sticker_name: "Approved", color_code: "#22c55e", icon_name: "FiCheckCircle" },
  { card_sticker_id: "sticker-done", sticker_name: "Done", color_code: "#22c55e", icon_name: "FiCheck" },
];

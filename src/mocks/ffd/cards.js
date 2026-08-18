/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * Card rows in the exact raw shape `kanban_board/get_full_board/{board_id}` returns
 * per column (`stage.columns[].cards_by_swimlane[swimlane_id][]`) — see
 * mapBoardWorkflowFromApi in src/shared/helpers/data.js for the field mapping.
 * Deliberately varied per card: short/long title, with/without description-equivalent
 * fields, priority, assignee, type, blocker, sticker, tag, progress, timeline text
 * (including an "overdue" example as free text, since there is no due-date field
 * rendered on board cards in the current generic card architecture).
 *
 * Only fields the generic CardItem/CardForm architecture actually reads are used —
 * see CardItem.jsx and mapBoardWorkflowFromApi for the supported field list.
 */

import { mockCardTypes, mockCardTags, mockCardBlockers, mockCardStickers } from "./cardMeta";

const type = (key) => mockCardTypes.find((t) => t.card_type_id === key);
const tag = (key) => mockCardTags.find((t) => t.card_tag_id === key);
const blocker = (key) => mockCardBlockers.find((b) => b.card_blocker_id === key);
const sticker = (key) => mockCardStickers.find((s) => s.card_sticker_id === key);

/** Applies a picked type/tag/blocker/sticker row's fields onto a raw mock card. */
const withType = (row) => ({
  card_type_id: row.card_type_id,
  card_type_name: row.type_name,
  card_type_color: row.color_code,
  card_type_icon: row.icon_name,
});
const withTag = (row) => ({ card_tag_id: row.card_tag_id });
const withBlocker = (row) => ({
  card_blocker_id: row.card_blocker_id,
  blocker_name: row.blocker_name,
  blocker_color: row.color_code,
  blocker_icon: row.icon_name,
});
const withSticker = (row) => ({
  card_sticker_id: row.card_sticker_id,
  sticker_name: row.sticker_name,
  sticker_color: row.color_code,
  sticker_icon: row.icon_name,
});

// ---- FFD Operations Board (5-column primary demo board) ----

export const opsBoardCardsByColumn = {
  "col-new": [
    {
      card_id: "ffd-card-1",
      card_name: "Prepare service request",
      username: "",
      ...withType(type("type-task")),
    },
    {
      card_id: "ffd-card-2",
      card_name: "Review client documents",
      username: "Alex Johnson",
      billing_entity: "Acme Industries",
      ...withType(type("type-review")),
      ...withTag(tag("tag-docs")),
    },
    {
      card_id: "ffd-card-3",
      card_name: "Client clarification required",
      username: "Sam Lee",
      priority: true,
      ...withBlocker(blocker("blocker-client")),
      ...withTag(tag("tag-followup")),
    },
  ],
  "col-assigned": [
    {
      card_id: "ffd-card-4",
      card_name: "Assign operations team",
      username: "Priya Patel",
      kpi_percentage: 20,
      timeline: "5d left",
      ...withType(type("type-task")),
    },
    {
      card_id: "ffd-card-5",
      card_name: "Verify request details",
      username: "Jordan Smith",
      ...withSticker(sticker("sticker-needs-check")),
    },
    {
      card_id: "ffd-card-6",
      card_name: "Schedule field activity",
      username: "Alex Johnson",
      timeline: "3d left",
      ...withType(type("type-field")),
      ...withTag(tag("tag-urgent")),
    },
    {
      card_id: "ffd-card-7",
      card_name: "Upload supporting documents for the client's service request before the review deadline",
      username: "",
      task_name: "Attach files",
    },
  ],
  "col-in-progress": [
    {
      card_id: "ffd-card-8",
      card_name: "Update service status",
      username: "Sam Lee",
      kpi_percentage: 55,
      timeline: "2d left",
      card_color: "#0d9488",
      ...withType(type("type-task")),
    },
    {
      card_id: "ffd-card-9",
      card_name: "Manager review",
      username: "Priya Patel",
      ...withType(type("type-review")),
      ...withBlocker(blocker("blocker-approval")),
    },
    {
      card_id: "ffd-card-10",
      card_name: "Fix issue",
      username: "",
    },
    {
      card_id: "ffd-card-11",
      card_name: "Coordinate with field team",
      username: "Jordan Smith",
      kpi_percentage: 40,
      timeline: "1d left",
      ...withType(type("type-field")),
    },
  ],
  "col-review": [
    {
      card_id: "ffd-card-12",
      card_name: "Complete final verification",
      username: "Alex Johnson",
      kpi_percentage: 90,
      ...withSticker(sticker("sticker-approved")),
      ...withType(type("type-review")),
    },
    {
      card_id: "ffd-card-13",
      card_name: "Manager sign-off pending",
      username: "Priya Patel",
      ...withBlocker(blocker("blocker-approval")),
      ...withTag(tag("tag-internal")),
    },
    {
      card_id: "ffd-card-14",
      card_name: "Submit report",
      username: "Sam Lee",
      timeline: "Overdue by 2 days",
      card_color: "#dc2626",
    },
  ],
  "col-completed": [
    {
      card_id: "ffd-card-15",
      card_name: "Close service request",
      username: "Jordan Smith",
      kpi_percentage: 100,
      ...withSticker(sticker("sticker-done")),
      ...withType(type("type-task")),
    },
    {
      card_id: "ffd-card-16",
      card_name: "Archive documentation",
      username: "",
    },
    {
      card_id: "ffd-card-17",
      card_name: "Client satisfaction confirmed",
      username: "Alex Johnson",
      billing_entity: "North Region Team",
      kpi_percentage: 100,
      ...withType(type("type-review")),
    },
  ],
};

// ---- Service Requests (secondary, smaller board — proves the same generic
// components render a completely different board shape, not a hardcoded one) ----

export const serviceBoardCardsByColumn = {
  "svc-col-new": [
    { card_id: "svc-card-1", card_name: "Log new service request", username: "Priya Patel" },
    { card_id: "svc-card-2", card_name: "Triage incoming ticket", username: "" },
  ],
  "svc-col-progress": [
    {
      card_id: "svc-card-3",
      card_name: "Investigate reported issue",
      username: "Jordan Smith",
      kpi_percentage: 35,
      timeline: "4d left",
    },
    { card_id: "svc-card-4", card_name: "Contact requestor for details", username: "Sam Lee" },
  ],
  "svc-col-done": [
    { card_id: "svc-card-5", card_name: "Resolved and closed", username: "Alex Johnson", kpi_percentage: 100 },
    { card_id: "svc-card-6", card_name: "Confirmed with requestor", username: "Priya Patel", kpi_percentage: 100 },
  ],
};

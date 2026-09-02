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
 *
 * Most boards keep one flat array per column (single "default" swimlane, filled in
 * by src/mocks/ffd/index.js). The Operations board has two swimlanes (Priority /
 * Non Priority — see boards.js), so its per-column entries are keyed by swimlane id
 * instead of a flat array.
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

// ---- FFD Commercials (RFQ -> Rates Requested -> Quoted -> Won / Cancelled) ----

export const commercialsBoardCardsByColumn = {
  "col-rfq": [
    {
      card_id: "comm-card-1",
      card_name: "RFQ-1024 | ABC Traders | Air Freight",
      username: "Alex Johnson",
      billing_entity: "ABC Traders",
      ...withType(type("type-request")),
    },
    {
      card_id: "comm-card-2",
      card_name: "RFQ-1025 | Nova Logistics | Sea Freight",
      username: "Priya Patel",
      billing_entity: "Nova Logistics",
      ...withType(type("type-request")),
    },
  ],
  "col-rates-requested": [
    {
      card_id: "comm-card-3",
      card_name: "Vendor rates sourced — DHL, FedEx, Aramex",
      username: "Sam Lee",
      task_name: "Min 2-3 rates to be uploaded as PDF",
      ...withTag(tag("tag-followup")),
    },
    {
      card_id: "comm-card-4",
      card_name: "Rate request shared with vendors",
      username: "Jordan Smith",
      billing_entity: "Nova Logistics",
    },
  ],
  "col-quoted-comm": [
    {
      card_id: "comm-card-5",
      card_name: "Quotation sent to ABC Traders",
      username: "Alex Johnson",
      kpi_percentage: 100,
      ...withSticker(sticker("sticker-approved")),
    },
  ],
  "col-won": [
    {
      card_id: "comm-card-6",
      card_name: "Job confirmed — ABC Traders",
      username: "Priya Patel",
      kpi_percentage: 100,
      ...withType(type("type-task")),
    },
  ],
  "col-cancelled-comm": [
    {
      card_id: "comm-card-7",
      card_name: "RFQ cancelled — Nova Logistics",
      username: "Sam Lee",
      card_color: "#dc2626",
      task_name: "Reason: client sourced alternate carrier",
    },
  ],
};

// ---- FFD Operations Board (Quoted Basis / Contractual -> Completed -> Costing / Cancelled) ----
// Two swimlanes: Priority / Non Priority (see priorityNonPrioritySwimlanes in boards.js).

export const opsBoardCardsByColumn = {
  "col-ops-quoted": {
    priority: [
      {
        card_id: "ffd-card-1",
        card_name: "Prepare service request",
        username: "",
        ...withType(type("type-task")),
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
    "non-priority": [
      {
        card_id: "ffd-card-2",
        card_name: "Review client documents",
        username: "Alex Johnson",
        billing_entity: "Acme Industries",
        ...withType(type("type-review")),
        ...withTag(tag("tag-docs")),
      },
    ],
  },
  "col-ops-contractual": {
    priority: [
      {
        card_id: "ffd-card-4",
        card_name: "Assign operations team",
        username: "Priya Patel",
        kpi_percentage: 20,
        timeline: "5d left",
        ...withType(type("type-task")),
      },
    ],
    "non-priority": [
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
    ],
  },
  "col-ops-completed": {
    priority: [
      {
        card_id: "ffd-card-8",
        card_name: "Update service status",
        username: "Sam Lee",
        kpi_percentage: 55,
        timeline: "2d left",
        card_color: "#0d9488",
        ...withType(type("type-task")),
      },
    ],
    "non-priority": [
      {
        card_id: "ffd-card-9",
        card_name: "Manager review",
        username: "Priya Patel",
        ...withType(type("type-review")),
        ...withBlocker(blocker("blocker-approval")),
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
  },
  "col-ops-costing-issued": {
    priority: [
      {
        card_id: "ffd-card-12",
        card_name: "Complete final verification",
        username: "Alex Johnson",
        kpi_percentage: 90,
        ...withSticker(sticker("sticker-approved")),
        ...withType(type("type-review")),
      },
    ],
    "non-priority": [
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
  },
  "col-ops-cancelled": {
    priority: [
      {
        card_id: "ffd-card-18",
        card_name: "Job cancelled — client request",
        username: "Jordan Smith",
        card_color: "#dc2626",
        task_name: "Reason to be updated in comments",
      },
    ],
    "non-priority": [
      {
        card_id: "ffd-card-19",
        card_name: "Cancelled — duplicate request",
        username: "",
        card_color: "#dc2626",
      },
    ],
  },
};

// ---- FFD Customs Clearance (Documents Received -> Under Review -> Duty Assessment -> Cleared / Held) ----

export const customsBoardCardsByColumn = {
  "col-customs-docs-received": [
    {
      card_id: "customs-card-1",
      card_name: "Import docs received — Al Rashid Trading",
      username: "Sam Lee",
      ...withType(type("type-task")),
    },
  ],
  "col-customs-under-review": [
    {
      card_id: "customs-card-2",
      card_name: "Reviewing HS codes — BGP Arabia Co.",
      username: "Jordan Smith",
      ...withType(type("type-review")),
    },
  ],
  "col-customs-duty-assessment": [
    {
      card_id: "customs-card-3",
      card_name: "Duty assessment in progress — Gulf Freight Co.",
      username: "Priya Patel",
      ...withTag(tag("tag-urgent")),
    },
  ],
  "col-customs-cleared": [
    {
      card_id: "customs-card-4",
      card_name: "Cleared for delivery — Nova Logistics",
      username: "Alex Johnson",
      kpi_percentage: 100,
      ...withSticker(sticker("sticker-done")),
    },
  ],
  "col-customs-held": [
    {
      card_id: "customs-card-5",
      card_name: "Held — missing certificate of origin",
      username: "Sam Lee",
      card_color: "#dc2626",
      ...withBlocker(blocker("blocker-client")),
    },
  ],
};

// ---- FFD Billing Board (Costing Issued -> Invoice Issued -> Submitted -> Job Completed -> Ready to Archive) ----

export const billingBoardCardsByColumn = {
  "col-billing-costing-issued": [
    {
      card_id: "bill-card-1",
      card_name: "Costing sheet prepared",
      username: "Sam Lee",
      ...withType(type("type-task")),
    },
    {
      card_id: "bill-card-2",
      card_name: "Costing pending review",
      username: "Priya Patel",
      ...withBlocker(blocker("blocker-approval")),
    },
  ],
  "col-billing-invoice-issued": [
    {
      card_id: "bill-card-3",
      card_name: "Invoice #INV-2044 issued",
      username: "Alex Johnson",
      ...withSticker(sticker("sticker-done")),
    },
    {
      card_id: "bill-card-4",
      card_name: "Invoice sent to client",
      username: "Jordan Smith",
    },
  ],
  "col-billing-invoice-submitted": [
    {
      card_id: "bill-card-5",
      card_name: "Invoice submitted to finance",
      username: "Sam Lee",
      ...withType(type("type-task")),
    },
  ],
  "col-billing-job-completed": [
    {
      card_id: "bill-card-6",
      card_name: "Job completed — awaiting documents",
      username: "Priya Patel",
      kpi_percentage: 100,
    },
  ],
  "col-billing-ready-archive": [
    {
      card_id: "bill-card-7",
      card_name: "Ready to archive — all documents received",
      username: "Alex Johnson",
      kpi_percentage: 100,
      ...withSticker(sticker("sticker-done")),
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

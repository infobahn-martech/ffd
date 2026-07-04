export const BUSINESS_RULES = [
  {
    id: 1,
    name: 'Card is created',
    icon: 'create',
    description:
      'Triggers when a new card is created. Use this to send notifications, assign defaults, or start workflows automatically.',
  },
  {
    id: 2,
    name: 'Card is updated',
    icon: 'update',
    description:
      'Triggers when any field on a card changes. Use this to track changes, update related cards, or send change notifications.',
  },
  {
    id: 3,
    name: 'Card is moved',
    icon: 'moved',
    description:
      'Triggers when a card moves between columns or lanes. Use this to update status, notify stakeholders, or run location-based workflows.',
  },
  {
    id: 4,
    name: 'Child card is blocked',
    icon: 'child-blocked',
    description:
      'Triggers when a child card is marked blocked. Use this to notify stakeholders, pause parent progress, or escalate blocked work.',
  },
  {
    id: 5,
    name: 'Child card is moved',
    icon: 'child-moved',
    description:
      'Triggers when a child card moves. Use this to sync parent status, align child movement with parent workflows, or send updates.',
  },
  {
    id: 6,
    name: 'All children are moved',
    icon: 'all-children-moved',
    description:
      'Triggers when every child card has moved to the target location or status. Use this to complete parents or start the next phase.',
  },
];

export const SHARE_WITH_OPTIONS = [
  { value: 'just_me', label: 'Just me' },
  { value: 'board', label: 'Board members' },
  { value: 'workspace', label: 'Workspace members' },
  { value: 'everyone', label: 'Everyone' },
];

export const THEN_ACTION_SECTIONS = [
  { id: 'create', title: 'Create cards or subtasks' },
  { id: 'update', title: 'Update the card details' },
  { id: 'link', title: 'Link the card' },
  { id: 'move', title: 'Move the card' },
  { id: 'notify', title: 'Send notifications' },
];

export const CREATE_ACTION_OPTIONS = [
  { key: 'card', label: 'Create card' },
  { key: 'child', label: 'Create child' },
  { key: 'parent', label: 'Create parent' },
  { key: 'predecessor', label: 'Create predecessor' },
  { key: 'relative', label: 'Create relative' },
  { key: 'subtask', label: 'Create subtask' },
  { key: 'successor', label: 'Create successor' },
];

export const LINK_ACTION_OPTIONS = [
  { key: 'child', label: 'Link as child' },
  { key: 'parent', label: 'Link as parent' },
  { key: 'predecessor', label: 'Link as predecessor' },
  { key: 'relative', label: 'Link as relative' },
  { key: 'successor', label: 'Link as successor' },
];

export const MOVE_ACTION_OPTIONS = [
  { key: 'move_to', label: 'Move card to' },
];

export const UPDATE_ACTION_OPTIONS = [
  { key: 'add_co_owners', label: 'Add co-owners' },
  { key: 'add_stickers', label: 'Add stickers' },
  { key: 'add_watcher', label: 'Add watcher' },
  { key: 'remove_co_owners', label: 'Remove co-owners' },
  { key: 'remove_milestones', label: 'Remove milestones' },
  { key: 'remove_stickers', label: 'Remove stickers' },
  { key: 'set_blocker', label: 'Set blocker' },
  { key: 'set_color', label: 'Set color' },
  { key: 'set_deadline', label: 'Set deadline' },
  { key: 'set_description', label: 'Set description' },
  { key: 'set_milestones', label: 'Set milestones' },
  { key: 'set_owner', label: 'Set owner' },
  { key: 'set_priority', label: 'Set priority' },
  { key: 'set_size', label: 'Set size' },
  { key: 'set_tags', label: 'Set tags' },
  { key: 'set_title', label: 'Set title' },
  { key: 'set_type', label: 'Set type' },
  { key: 'unblock_card', label: 'Unblock card' },
];

// Dev-only fallback data for the "Card property match" modal, used when the
// real business_rule field endpoints return nothing (e.g. local dev without
// a live backend). Never shown in production builds.
export const DUMMY_REGULAR_FIELDS = [
  'Attachments', 'Block time', 'Blocked', 'Blocker', 'Board', 'Card ID', 'Child cards', 'Co-owners',
  'Color', 'Column', 'Comments', 'Created at', 'Custom card ID', 'Cycle time', 'Deadline', 'Description',
  'Finished subtasks count', 'First blocked date', 'First date moved to',
  'Internal card id', 'Lane', 'Last blocked date', 'Last date moved out of', 'Last date moved to',
  'Last modified', 'Last moved', 'Logged time', 'Milestones', 'Owner', 'Owners', 'Parent cards',
  'Position', 'Priority', 'Relative cards', 'Reporter', 'Section', 'Size', 'Stickers',
  'Subtasks progress', 'Tags', 'Title', 'Total subtasks count', 'Type', 'Unfinished subtasks count',
  'Watchers', 'Workflow',
].map((label, idx) => ({ regular_field_id: idx + 1, field_label: label, field_key: label }));

export const DUMMY_TIME_UNITS = ['Days', 'Hours', 'Minutes', 'Seconds']
  .map((label, idx) => ({ time_unit_id: idx + 1, unit_label: label, unit_key: label }));

// Dev-only fallback title for the "Board Minimap" grid's top title bar.
export const DUMMY_BOARD_TITLE = 'Tasks';

// Dev-only fallback column structure for the "Board Minimap" grid header, used so the
// walkthrough always shows this fixed layout regardless of the real board's columns.
// WAREHOUSE AND LOGISTICS and DELIVERY STATUS each span 3 leaf columns (see
// DUMMY_BOARD_LEAF_COLUMNS); the others span 1.
export const DUMMY_BOARD_AREA_GROUPS = [
  { area: null, color: '#9ca3af', span: 1 },
  { area: 'SALES TEAM', color: '#1d4ed8', span: 1 },
  { area: 'WAREHOUSE AND LOGISTICS', color: '#f97316', span: 3 },
  { area: 'DELIVERY STATUS', color: '#16a34a', span: 3 },
  { area: null, color: '#7c3aed', span: 1 },
];

// Header cells, each tagged with a gridArea matching the CSS grid-template-areas in
// business-rules-modal.scss. PREPARE ORDER and ORDER COMPLETED occupy the top row and
// span their child leaf columns below them.
export const DUMMY_BOARD_HEADER_CELLS = [
  { name: 'WEATHER FORECAST', gridArea: 'weather' },
  { name: 'Create Job No', gridArea: 'create' },
  { name: 'PREPARE ORDER', gridArea: 'prepare' },
  { name: 'ORDER COMPLETED', gridArea: 'completed' },
  { name: 'ORDER REQUESTED', gridArea: 'requested' },
  { name: 'ORDER IN PROGRESS', gridArea: 'progress' },
  { name: 'TRUCK DEPARTED', gridArea: 'departed' },
  { name: 'TRUCK AT PORT', gridArea: 'port' },
  { name: 'DELIVERY COMPLETED', gridArea: 'delivery' },
  { name: 'UN DELIVERED', gridArea: 'undelivered' },
  { name: 'Ready to Archive', gridArea: 'archive' },
];

// Flattened leaf columns (left to right) — one clickable cell per lane row, aligned
// under the header grid above. `accent` is a fixed demo highlight (not tied to real
// card counts) matching the walkthrough mockup's green/red cells on every lane.
export const DUMMY_BOARD_LEAF_COLUMNS = [
  { id: 'weather', name: 'WEATHER FORECAST' },
  { id: 'create', name: 'Create Job No' },
  { id: 'requested', name: 'ORDER REQUESTED' },
  { id: 'progress', name: 'ORDER IN PROGRESS', accent: 'green' },
  { id: 'departed', name: 'TRUCK DEPARTED' },
  { id: 'port', name: 'TRUCK AT PORT' },
  { id: 'delivery', name: 'DELIVERY COMPLETED' },
  { id: 'undelivered', name: 'UN DELIVERED', accent: 'red' },
  { id: 'archive', name: 'Ready to Archive' },
];

// Dev-only fallback swimlane list for the "Board Minimap" grid, shown for every board
// regardless of the real board's actual lanes, per client-facing walkthrough requirements.
export const DUMMY_BOARD_SWIMLANES = [
  { id: 1, name: 'TANAJIB', colorCode: '#0d1b8c' },
  { id: 2, name: 'RASTANURA', colorCode: '#2fab7d' },
  { id: 3, name: 'JUBAIL', colorCode: '#6b7280' },
  { id: 4, name: 'DAMMAM', colorCode: '#0e7ec4' },
  { id: 5, name: 'ABU ALI', colorCode: '#f57c00' },
  { id: 6, name: 'KHAFJI', colorCode: '#efe9d3' },
  { id: 7, name: 'SAFFANIYA', colorCode: '#7c3aed' },
  { id: 8, name: 'RAS AL KHAIR', colorCode: '#1b5e20' },
  { id: 9, name: 'JUAYMAH', colorCode: '#fbc02d' },
  { id: 10, name: 'TEST', colorCode: '#94a3b8' },
  { id: 11, name: 'Default Swimlane', colorCode: '#cbd5e1' },
  { id: 12, name: 'New Swimlane', colorCode: '#e2e8f0' },
];

// Dev-only fallback data for the "Board Minimap" board picker, used when the
// real workspace/board endpoint returns nothing (e.g. local dev without a live backend).
export const DUMMY_WORKSPACE_BOARDS = [
  {
    workspace_id: 1,
    workspace_name: 'SEDRES - CHANDLING - WORK SPACE',
    boards: [
      { board_id: 1, board_name: 'CHANDLING OPERATIONS' },
      { board_id: 2, board_name: 'FROZEN' },
      { board_id: 3, board_name: 'LOGISTICS' },
      { board_id: 4, board_name: 'DRY AND CABIN ITEMS' },
      { board_id: 5, board_name: 'DN' },
      { board_id: 6, board_name: 'CHILLER' },
      { board_id: 7, board_name: 'SUPER MARKET MAIN BOARD' },
    ],
  },
  {
    workspace_id: 2,
    workspace_name: 'New Offshore Marine Logistics',
    boards: [
      { board_id: 8, board_name: 'Rastanura/ Dammam Operations' },
      { board_id: 9, board_name: 'Jubail Operations' },
      { board_id: 10, board_name: 'Centralized DA DESK' },
    ],
  },
  {
    workspace_id: 3,
    workspace_name: 'Limousine',
    boards: [
      { board_id: 11, board_name: 'Coordinator Transport' },
    ],
  },
];

export const DUMMY_CUSTOM_FIELDS = [
  '3rd Party Items', '3rd Party Launch hire (If any)', 'Additional Assignee', 'Airway bill no.',
  'Amount (In SAR)', 'any additional requirment will be based on cargo type', 'AP Number',
  'Appointment Email', 'Arrival procedure copy', 'Assigned Driver', 'ASSSIGNED VEHICLE', 'ATD', 'AWB',
  'AWBL copy from Agent/ shipping line', 'Bah Inv No', 'Bayan', 'Bidding Documents from client',
  'Billing Entity- -', 'BL copy from Agent/ shipping line', 'BL number', 'Buying Price [Excl. VAT]',
  'Card Picker', 'Cargo bayan copy', 'Cargo collection date', 'Cargo Invoice & BL', 'CG PERMIT COPY',
  'CIPL / BL - Vessel', 'CIPL FFD', 'CLIENT', 'Client Acknowledgment', 'Client Name (FFD)',
  'Commercial invoice', 'Commercial Proposal', 'Commodity', 'Consumable Invoice & BL',
  'COO certificate of origin', 'Copy of Export Bayan', 'Copy of Sales order', 'Costing for Bid',
  'Costing Issued On', 'Credit Terms', 'Crew Documents',
].map((label, idx) => ({ custom_field_id: idx + 1, field_label: label }));

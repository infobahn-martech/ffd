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

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

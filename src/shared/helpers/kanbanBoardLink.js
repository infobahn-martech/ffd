// Most department boards (Jubail Operations, MWP, GRO, Hotel, ...) are served by
// fixed named routes in router/index.jsx rather than the generic /kanban-board/:boardId
// route, so a display name has to be matched against this list before falling back
// to a numeric board id.
const KNOWN_BOARD_SLUGS = new Set([
  'centralized-da-desk',
  'jubail-operations',
  'rastanura-dammam-operations',
  'coordinator-transport',
  'ras-tanura-operations',
  'driver',
  'taxi-boat-captain',
  'taxi-boat-operator',
  'mwp',
  'gro',
  'hotel',
  'admin',
  'operator',
]);

const slugify = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export function resolveKanbanBoardPath(boardName, boardId) {
  const slug = slugify(boardName);
  if (KNOWN_BOARD_SLUGS.has(slug)) return `/kanban-board/${slug}`;
  if (boardId != null && boardId !== '') return `/kanban-board/${boardId}`;
  return null;
}

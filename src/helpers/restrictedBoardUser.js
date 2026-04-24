import { getItem } from './localStorage';

/** Sedres GRO (4) and Custom Clearance (5) — limited board/workspace access only */
export const SEDRES_RESTRICTED_ROLE_IDS = new Set(['4', '5']);

export const RESTRICTED_BOARD_HOME_PATH = '/kanban-board/1';

function toRoleIdString(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function collectRoleIdCandidatesFromUser(user) {
  if (!user || typeof user !== 'object') return [];
  const ids = [];
  const fromNested = toRoleIdString(user.role?.role_id);
  if (fromNested) ids.push(fromNested);
  const flat = toRoleIdString(user.role_id);
  if (flat) ids.push(flat);
  return ids;
}

/**
 * @param {object|null|undefined} user — e.g. Redux/Zustand userProfile or API `data`
 * @returns {boolean}
 */
export function isRestrictedBoardUser(user) {
  for (const id of collectRoleIdCandidatesFromUser(user)) {
    if (SEDRES_RESTRICTED_ROLE_IDS.has(id)) return true;
  }

  try {
    const raw = getItem('userProfile');
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const id of collectRoleIdCandidatesFromUser(parsed)) {
        if (SEDRES_RESTRICTED_ROLE_IDS.has(id)) return true;
      }
    }
  } catch {
    // ignore invalid cached profile JSON
  }

  const storedRole = toRoleIdString(getItem('role_id'));
  if (storedRole && SEDRES_RESTRICTED_ROLE_IDS.has(storedRole)) return true;

  return false;
}

/**
 * Paths allowed for restricted roles (HashRouter pathnames without hash).
 */
export function isRestrictedUserAllowedPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;
  if (pathname === '/workspaces' || pathname.startsWith('/workspaces/')) return true;
  if (
    pathname === RESTRICTED_BOARD_HOME_PATH ||
    pathname.startsWith(`${RESTRICTED_BOARD_HOME_PATH}/`)
  ) {
    return true;
  }
  return false;
}

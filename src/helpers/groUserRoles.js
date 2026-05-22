/** Sedres GRO User (API role_id 4) and GRO Supervisor (role_id 6) — shared UI permissions. */

export function normalizeRoleId(roleId) {
  if (roleId === undefined || roleId === null) return null;
  const s = String(roleId).trim();
  return s === "" ? null : s;
}

export function isGROUserRole(roleId) {
  return (
    roleId === "4" ||
    roleId === 4 ||
    roleId === "6" ||
    roleId === 6
  );
}

export function isGROSupervisorRole(roleId) {
  return roleId === "6" || roleId === 6;
}

export function collectUserRoleIdCandidates(user) {
  if (!user || typeof user !== "object") return [];
  const ids = [];
  const fromNested = normalizeRoleId(user.role?.role_id);
  if (fromNested) ids.push(fromNested);
  const flat = normalizeRoleId(user.role_id ?? user.roleId);
  if (flat) ids.push(flat);
  const fromUser = normalizeRoleId(user.user?.role_id);
  if (fromUser) ids.push(fromUser);
  const fromData = normalizeRoleId(user.data?.role_id);
  if (fromData) ids.push(fromData);
  return ids;
}

export function getFirstUserRoleId(user) {
  const candidates = collectUserRoleIdCandidates(user);
  return candidates.length > 0 ? candidates[0] : null;
}

export function userHasGROUserRole(user) {
  for (const id of collectUserRoleIdCandidates(user)) {
    if (isGROUserRole(id) || isGROUserRole(Number(id))) return true;
  }
  return false;
}

export function userHasGROSupervisorRole(user) {
  for (const id of collectUserRoleIdCandidates(user)) {
    if (isGROSupervisorRole(id) || isGROSupervisorRole(Number(id))) return true;
  }
  return false;
}

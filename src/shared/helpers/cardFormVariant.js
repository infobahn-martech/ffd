/**
 * Card modal variant from workflow `role_id` on get_full_board (per card), not logged-in user role.
 * @param {unknown} roleId - workflow.role_id from API
 * @returns {"gro"|"custom"|"default"}
 */
export function getCardVariantByWorkflowRole(roleId) {
  if (roleId == null || roleId === "") return "default";
  const n = Number(roleId);
  if (Number.isNaN(n)) return "default";
  if (n === 4 || n === 6 || n === 8 || n === 9 || n === 10 || n === 19) return "gro";
  if (n === 5) return "custom";
  if (n === 2) return "default";
  return "default";
}

/**
 * Resolves CardForm variant from card workflow role (desk user/supervisor roles share the gro mapping).
 * @param {unknown} workflowRoleId
 * @param {unknown} _userRoleId - reserved for callers; variant is workflow-driven only
 * @returns {"gro"|"custom"|"default"}
 */
export function resolveCardFormVariant(workflowRoleId, _userRoleId) {
  return getCardVariantByWorkflowRole(workflowRoleId);
}

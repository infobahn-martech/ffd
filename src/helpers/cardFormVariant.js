/**
 * Card modal variant from workflow `role_id` on get_full_board (per card), not logged-in user role.
 * @param {unknown} roleId - workflow.role_id from API
 * @returns {"gro"|"custom"|"default"}
 */
export function getCardVariantByWorkflowRole(roleId) {
  if (roleId == null || roleId === "") return "default";
  const n = Number(roleId);
  if (Number.isNaN(n)) return "default";
  if (n === 4) return "gro";
  if (n === 5) return "custom";
  if (n === 2) return "default";
  return "default";
}

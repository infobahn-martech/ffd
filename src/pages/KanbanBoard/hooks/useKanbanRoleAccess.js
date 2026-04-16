import { useMemo } from "react";
import { KANBAN_ROLE_LIST } from "../config/roles";
import { getKanbanRolePermissions } from "../config/rolePermissions";

export default function useKanbanRoleAccess(userRole = null) {
  const permissions = useMemo(
    () => getKanbanRolePermissions(userRole),
    [userRole]
  );

  return {
    roles: KANBAN_ROLE_LIST,
    currentRole: userRole,
    permissions,
  };
}

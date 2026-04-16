import { KANBAN_ROLE_LIST } from "./roles";

const DEFAULT_PERMISSIONS = Object.freeze({
  canViewBoard: true,
  canCreateCard: true,
  canEditCard: true,
  canMoveCard: true,
  canManageWorkflow: true,
});

export const KANBAN_ROLE_PERMISSIONS = Object.freeze(
  KANBAN_ROLE_LIST.reduce((acc, role) => {
    acc[role] = { ...DEFAULT_PERMISSIONS };
    return acc;
  }, {})
);

export const getKanbanRolePermissions = (role) =>
  KANBAN_ROLE_PERMISSIONS[role] || DEFAULT_PERMISSIONS;

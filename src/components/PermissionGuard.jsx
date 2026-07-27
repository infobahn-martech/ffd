import usePermissions from "../shared/hooks/usePermissions";

// Frontend-only visibility guard for the new permission system. NOT a
// security boundary — backend endpoints must independently validate user
// permissions.
//
// `legacyAllow` lets existing role-controlled features adopt this guard
// without regressing access: pass the pre-existing role condition so it
// keeps working while the permission system rolls out (see CLAUDE.md
// "Preserve the existing role-based logic"). Omit it for brand-new UI that
// has no legacy role condition to preserve.
function PermissionGuard({
  moduleKey,
  submoduleKey,
  actionKey,
  legacyAllow = false,
  fallback = null,
  children,
}) {
  const { hasPermission } = usePermissions();

  // Keep legacy role access until the role-based permission system is formally retired.
  const allowed = legacyAllow || hasPermission({ moduleKey, submoduleKey, actionKey });

  return allowed ? children : fallback;
}

export default PermissionGuard;

import { useMemo } from "react";
import useAuthReducer from "../../store/AuthReducer";
import {
  checkHasModule,
  checkHasSubmodule,
  checkHasPermission,
} from "../utils/permissions";

// Reads the normalised permission map (from AuthReducer, sourced from
// GET /users/getuserdetail/{userId} -> permissions.sections) and exposes
// boolean permission checks. This is additive to the existing role_id-based
// checks in the app — it does not replace them. Only subscribes to
// `permissionMap` so it doesn't re-render on unrelated auth store changes.
export default function usePermissions() {
  const permissionMap = useAuthReducer((state) => state.permissionMap);

  return useMemo(() => {
    const hasModule = (moduleKey) => checkHasModule(permissionMap, moduleKey);

    const hasSubmodule = (moduleKey, submoduleKey) =>
      checkHasSubmodule(permissionMap, moduleKey, submoduleKey);

    const hasPermission = (permission) =>
      checkHasPermission(permissionMap, permission);

    const hasAnyPermission = (permissionList = []) =>
      permissionList.some((permission) => hasPermission(permission));

    const hasAllPermissions = (permissionList = []) =>
      permissionList.length > 0 &&
      permissionList.every((permission) => hasPermission(permission));

    return {
      hasModule,
      hasSubmodule,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    };
  }, [permissionMap]);
}

export const modulePermissions = (userPermissions, moduleName) =>
  userPermissions
    .find(({ name }) => moduleName === name)
    ?.permissions?.map(({ name }) => name) || [];

export const subModulePermissions = (
  userPermissions,
  moduleName,
  subModuleName,
) =>
  userPermissions
    .find(({ name }) => moduleName === name)
    ?.permissions?.filter(({ subModule }) => subModule === subModuleName)
    .map(({ name }) => name) || [];

export const modulePermissionHasPermissions = (
  modulePermissionList,
  permissionArray,
) => {
  if (typeof permissionArray === 'string') {
    return modulePermissionList?.includes(permissionArray);
  }
  let includes = false;
  permissionArray?.forEach((permission) => {
    if (modulePermissionList?.includes(permission)) {
      includes = true;
    }
  });
  return includes;
};

export const hasModulePermission = (permissionList, module) => {
  const hasPermission = permissionList?.find(({ name }) => name === module);
  if (hasPermission) return true;
  return false;
};

export const hasSubModulePermission = (permissionList, subModuleName) => {
  const hasSubModule = permissionList?.some((e) =>
    e.permissions.some((e) => e?.subModule === subModuleName),
  );
  if (hasSubModule) return true;
  return false;
};

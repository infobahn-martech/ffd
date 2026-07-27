import { useEffect, useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal";
import icon from "../../../assets/images/icon-chevToggle.svg";
import usePermissionReducer from "../../../store/PermissionReducer";
import useAlertReducer from "../../../store/AlertReducer";
import "../../../design/scss/add-permissions.scss";

// Unique toggle ID builder
const buildToggleId = (...parts) => `toggle_${parts.join("_")}`;

// -------------------------------------------
//  TRANSFORM API RESPONSE TO COMPONENT STRUCTURE (Permission page - sub_modules/actions)
// -------------------------------------------
const mapAction = (action) => ({
  id: action.permission_id,
  title: action.action_name,
  permissionId: action.permission_id,
});

const transformPermissionsData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((level1Item) => {
    const section = {
      id: level1Item.permission_id,
      title: level1Item.module_name,
      permissionId: level1Item.permission_id,
    };

    const hasSubModules = level1Item.sub_modules && level1Item.sub_modules.length > 0;
    const hasActions = level1Item.actions && level1Item.actions.length > 0;

    // Direct actions on the level 1 module (e.g. Dashboard-style, or alongside sub_modules)
    section.items = hasActions ? level1Item.actions.map(mapAction) : [];

    // Sub-modules (level 2), each with their own actions (level 3)
    if (hasSubModules) {
      section.subSections = level1Item.sub_modules.map((subModule) => ({
        id: subModule.permission_id,
        title: subModule.submodule_name,
        permissionId: subModule.permission_id,
        items: (subModule.actions ?? []).map(mapAction),
      }));
    }

    return section;
  });
};

// -------------------------------------------
//  MAIN COMPONENT
// -------------------------------------------
export function PermissionModal({
  showModal,
  closeModal,
  userPermissions,
  selectedUser,
  onSuccess,
  updateUserPermission,
  isUpdatingUserPermission,
}) {
  const isUserPermissionMode =
    !!userPermissions && Array.isArray(userPermissions);

  const isEditMode =
    showModal &&
    typeof showModal === "object" &&
    !Array.isArray(showModal) &&
    !isUserPermissionMode;
  const editData = isEditMode ? showModal : null;

  const {
    permissionsList,
    isLoadingPermissions: isLoadingPermissionsList,
    fetchPermissionsList,
    fetchRolePermission,
    assignRolePermission,
    updateRolePermission,
    isBeingUpdated,
  } = usePermissionReducer();

  const { error: showError } = useAlertReducer();

  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [roleText, setRoleText] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleError, setRoleError] = useState("");

  // When opened from User page: list comes from full permissionsList; loading = list loading
  const isLoadingPermissions = isLoadingPermissionsList;

  // Fetch full permissions list when modal opens (both Permission page and User page)
  useEffect(() => {
    if (showModal) {
      setRoleError("");
      fetchPermissionsList();
      if (!isUserPermissionMode) {
        if (isEditMode && editData) {
          const roleId = editData.role_id ?? editData._id ?? editData.id;
          setRoleText(editData.role ?? "");
          setRoleDescription(editData.description ?? "");
          setSelectedPermissions(new Set());
          if (roleId) {
            fetchRolePermission({ role_id: roleId }).then(({ data }) => {
              if (!data) return;
              if (data.description)
                setRoleDescription(data.description ?? "");
              if (Array.isArray(data?.permission_ids)) {
                setSelectedPermissions(new Set(data.permission_ids.map(Number)));
              } else if (data?.permissions?.length) {
                const ids = new Set(
                  data.permissions.map((p) => Number(p.permission_id ?? p.id ?? p))
                );
                setSelectedPermissions(ids);
              } else if (Array.isArray(data?.permission_id)) {
                setSelectedPermissions(new Set(data.permission_id.map(Number)));
              } else if (Array.isArray(data)) {
                const allowed = data
                  .filter((p) => p.is_allowed === "1" || p.is_allowed === 1)
                  .map((p) => Number(p.permission_id ?? p.id ?? p));
                setSelectedPermissions(new Set(allowed));
              }
            });
          }
        } else {
          setRoleText("");
          setRoleDescription("");
          setSelectedPermissions(new Set());
          setRoleError("");
        }
      }
    }
  }, [
    showModal,
    isUserPermissionMode,
    isEditMode,
    editData,
    fetchPermissionsList,
    fetchRolePermission,
  ]);

  // When opened from User page: pre-fill from getUserPermissions (is_allowed === '1'), or reset when none/error
  useEffect(() => {
    if (showModal && isUserPermissionMode && selectedUser) {
      if (userPermissions?.length) {
        const allowed = new Set(
          userPermissions
            .filter((p) => p.is_allowed === "1" || p.is_allowed === 1)
            .map((p) => Number(p.permission_id))
        );
        setSelectedPermissions(allowed);
        const first = userPermissions[0];
        if (first?.role) setRoleText(String(first.role));
        else if (selectedUser?.role) setRoleText(String(selectedUser.role));
      } else {
        setSelectedPermissions(new Set());
        setRoleText("");
        setRoleDescription("");
      }
    }
  }, [showModal, isUserPermissionMode, selectedUser, userPermissions]);

  // Always use full permissions list for display (same structure as Permission page)
  const PERMISSION_SECTIONS = useMemo(() => {
    return transformPermissionsData(permissionsList);
  }, [permissionsList]);

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(Number(permissionId));
      else newSet.delete(Number(permissionId));
      return newSet;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUserPermissionMode) {
      if (!selectedUser?.user_id) {
        showError("Invalid user");
        return;
      }

      const permissions = Array.from(
        // Build the full list: every known permission id mapped to is_allowed
        (permissionsList ?? []).flatMap((level1) => {
          const collectIds = (item) => {
            const ids = [item.permission_id];
            if (item.subpermission?.length) {
              item.subpermission.forEach((sub) => ids.push(...collectIds(sub)));
            }
            return ids;
          };
          return collectIds(level1);
        })
      ).map((permission_id) => ({
        permission_id,
        is_allowed: selectedPermissions.has(permission_id) ? 1 : 0,
      }));

      const cb = () => {
        onSuccess?.();
        closeModal?.(null);
      };

      await updateUserPermission?.({
        user_id: selectedUser.user_id,
        permissions,
        cb,
      });
      return;
    }

    const role = roleText?.trim();
    if (!role) {
      setRoleError("Role name is required");
      return;
    }
    setRoleError("");

    if (selectedPermissions.size === 0) {
      showError("Please select at least one permission");
      return;
    }

    const permissionIdArray = Array.from(selectedPermissions).map(Number);
    const cb = () => {
      onSuccess?.();
      closeModal?.(null);
    };

    if (isEditMode && editData) {
      const roleId = editData.role_id ?? editData._id ?? editData.id;
      if (!roleId) {
        showError("Invalid role for update");
        return;
      }
      await updateRolePermission({
        role_id: roleId,
        role,
        description: roleDescription?.trim() ?? "",
        permission_id: permissionIdArray,
        cb,
      });
    } else {
      await assignRolePermission({
        role,
        description: roleDescription?.trim() ?? "",
        permission_id: permissionIdArray,
        cb,
      });
    }
  };

  // Check if a permission is selected
  const isPermissionSelected = (permissionId) => selectedPermissions.has(Number(permissionId));

  // Handle section-level toggle (select/deselect all children)
  const handleSectionToggle = (section, checked) => {
    const permissionIds = [];

    // Collect all permission IDs from this section
    if (section.items && section.items.length > 0) {
      section.items.forEach((item) => {
        permissionIds.push(Number(item.permissionId || item.id));
      });
    }

    if (section.subSections && section.subSections.length > 0) {
      section.subSections.forEach((sub) => {
        permissionIds.push(Number(sub.permissionId || sub.id));
        if (sub.items && sub.items.length > 0) {
          sub.items.forEach((item) => {
            permissionIds.push(Number(item.permissionId || item.id));
          });
        }
      });
    }

    // Also include the section itself
    permissionIds.push(Number(section.permissionId || section.id));

    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissionIds.forEach((id) => {
        if (checked) newSet.add(id);
        else newSet.delete(id);
      });
      return newSet;
    });
  };

  // -------------------------------------------
  //  RENDER TOP LEVEL MENU
  // -------------------------------------------
  const renderTopLevel = (section) => {
    const hasSub = section.subSections && section.subSections.length > 0;
    const hasItems = section.items && section.items.length > 0;
    const collapseId = `permission_${section.id}_items`;
    const subCollapseId = `permission_${section.id}_sub`;
    const toggleId = buildToggleId(section.id);
    const sectionPermissionId = section.permissionId || section.id;
    const isSectionSelected = isPermissionSelected(sectionPermissionId);

    return (
      <div className="permCheck-item" key={section.id}>
        <div className="permCheckWrp">
          <div className="title">{section.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input
                type="checkbox"
                id={toggleId}
                checked={isSectionSelected}
                onChange={(e) => handleSectionToggle(section, e.target.checked)}
              />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button
            type="button"
            className="btn btn-toggle"
            {...(hasSub || hasItems
              ? {
                "data-bs-toggle": "collapse",
                "data-bs-target": [hasItems && `#${collapseId}`, hasSub && `#${subCollapseId}`]
                  .filter(Boolean)
                  .join(", "),
                "aria-expanded": "false",
                "aria-controls": [hasItems && collapseId, hasSub && subCollapseId]
                  .filter(Boolean)
                  .join(" "),
              }
              : {})}
          >
            <img src={icon} alt="down" />
          </button>
        </div>

        {/* DIRECT ITEMS (Dashboard Case) */}
        {hasItems && (
          <div className="collapse" id={collapseId}>
            <div className="permcheck-subitems row">
              {section.items.map((item) => renderDirectItem(section, item))}
            </div>
          </div>
        )}

        {/* SUB-SECTIONS (User Management etc.) */}
        {hasSub && (
          <div className="permCheck-inner">
            <div className="collapse" id={subCollapseId}>
              <div className="permInnerItems">
                {section.subSections.map((sub) => renderSubLevel(section, sub))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------
  //  Render Level 2 (Submenu)
  // -------------------------------------------
  const renderSubLevel = (section, sub) => {
    const hasItems = sub.items && sub.items.length > 0;
    const collapseId = `permission_${section.id}_${sub.id}`;
    const toggleId = buildToggleId(section.id, sub.id);
    const subPermissionId = sub.permissionId || sub.id;
    const isSubSelected = isPermissionSelected(subPermissionId);

    // Handle sub-section toggle
    const handleSubToggle = (checked) => {
      const permissionIds = [Number(subPermissionId)];
      if (sub.items && sub.items.length > 0) {
        sub.items.forEach((item) => {
          permissionIds.push(Number(item.permissionId || item.id));
        });
      }

      setSelectedPermissions((prev) => {
        const newSet = new Set(prev);
        permissionIds.forEach((id) => {
          if (checked) newSet.add(id);
          else newSet.delete(id);
        });
        return newSet;
      });
    };

    return (
      <div className="permCheck-item level_2" key={sub.id}>
        <div className="permCheckWrp">
          <div className="title">{sub.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input
                type="checkbox"
                id={toggleId}
                checked={isSubSelected}
                onChange={(e) => handleSubToggle(e.target.checked)}
              />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          {hasItems && (
            <button
              className="btn btn-toggle"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${collapseId}`}
            >
              <img src={icon} alt="down" />
            </button>
          )}
        </div>

        {hasItems && (
          <div className="collapse" id={collapseId}>
            <div className="permcheck-subitems row">
              {sub.items.map((item) => renderItem(section, sub, item))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------
  //  Render Dashboard direct items
  // -------------------------------------------
  const renderDirectItem = (section, item) => {
    const toggleId = buildToggleId(section.id, item.id);
    const itemPermissionId = item.permissionId || item.id;
    const isItemSelected = isPermissionSelected(itemPermissionId);

    return (
      <div className="col-xl-4 col-md-6" key={item.id}>
        <div className="permCheckWrp">
          <div className="title">{item.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input
                type="checkbox"
                id={toggleId}
                checked={isItemSelected}
                onChange={(e) =>
                  handlePermissionChange(itemPermissionId, e.target.checked)
                }
              />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button className="btn btn-toggle" type="button">
            <img src={icon} alt="down" />
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------
  //  Render Item (List / Add / Edit...)
  // -------------------------------------------
  const renderItem = (section, sub, item) => {
    const toggleId = buildToggleId(section.id, sub.id, item.id);
    const itemPermissionId = item.permissionId || item.id;
    const isItemSelected = isPermissionSelected(itemPermissionId);

    return (
      <div className="col-xl-4 col-md-6" key={item.id}>
        <div className="permCheckWrp">
          <div className="title">{item.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input
                type="checkbox"
                id={toggleId}
                checked={isItemSelected}
                onChange={(e) =>
                  handlePermissionChange(itemPermissionId, e.target.checked)
                }
              />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button className="btn btn-toggle" type="button">
            <img src={icon} alt="down" />
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------
  //  Body
  // -------------------------------------------
  const renderBody = () => (
    <div className="modal-body">
      <div className="addPermissions">
        <form id="permissionForm" onSubmit={handleSubmit}>
          {/* UPDATED: Role Text Field + Description Textarea (right side) */}
          <div className="permInputs row g-3">
            <div className="col-md-6">
              <div className="form-floating desig-inp">
                <input
                  type="text"
                  className={`form-control${roleError ? " is-invalid" : ""}`}
                  id="floatingRole"
                  placeholder="Role"
                  value={
                    isUserPermissionMode && selectedUser
                      ? selectedUser.role ?? userPermissions?.[0]?.role ?? ""
                      : roleText
                  }
                  readOnly={isUserPermissionMode && selectedUser}
                  onChange={(e) => {
                    setRoleText(e.target.value);
                    if (roleError) setRoleError("");
                  }}
                />
                <label htmlFor="floatingRole">Role
                  <span className="text-danger">*</span>
                </label>
                {roleError && (
                  <span className="error text-danger">{roleError}</span>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-floating desig-inp">
                <textarea
                  className="form-control permission-description-textarea"
                  id="floatingDesc"
                  placeholder="Description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  readOnly={isUserPermissionMode && selectedUser}
                />
                <label htmlFor="floatingDesc">Description</label>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingPermissions && (
            <div className="text-center py-4">
              <p>Loading permissions...</p>
            </div>
          )}

          {/* Render dynamic sections */}
          {!isLoadingPermissions && PERMISSION_SECTIONS.length > 0 && (
            PERMISSION_SECTIONS.map((section) => renderTopLevel(section))
          )}

          {/* Empty state */}
          {!isLoadingPermissions && PERMISSION_SECTIONS.length === 0 && (
            <div className="text-center py-4">
              <p>No permissions available</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  // -------------------------------------------
  //  Footer
  // -------------------------------------------
  const renderFooter = () => {
    const isSaving = isUserPermissionMode
      ? !!isUpdatingUserPermission
      : !!isBeingUpdated;

    return (
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => closeModal?.(null)}
          disabled={isSaving}
        >
          Close
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          form="permissionForm"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    );
  };

  return (
    <CustomModal
      className="modal fade addPermissionMod show"
      dialgName="custom-mod custom-mod-xl modal-dialog modal-dialog-centered modal-dialog-scrollable"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={
        <h1 className="modal-title fs-5">
          {isUserPermissionMode && selectedUser
            ? `User Permissions - ${selectedUser.firstName ?? selectedUser.name ?? "User"}`
            : isEditMode
              ? "Edit Designation and Permission"
              : "Add Designation and Permission"}
        </h1>
      }
    />
  );
}

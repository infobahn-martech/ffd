import { useEffect, useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal";
import icon from "../../../assets/images/icon-chevToggle.svg";
import usePermissionReducer from "../../../store/PermissionReducer";
import useAlertReducer from "../../../store/AlertReducer";
import "../../../design/scss/add-permissions.scss";

// Unique toggle ID builder
const buildToggleId = (...parts) => `toggle_${parts.join("_")}`;

// -------------------------------------------
//  TRANSFORM API RESPONSE TO COMPONENT STRUCTURE (Permission page - nested subpermission)
// -------------------------------------------
const transformPermissionsData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((level1Item) => {
    const section = {
      id: level1Item.permission_id,
      title: level1Item.section_name,
      permissionId: level1Item.permission_id,
    };

    // Check if level 1 has subpermissions
    if (level1Item.subpermission && level1Item.subpermission.length > 0) {
      // Check if any level 2 item has subpermissions (level 3)
      const hasLevel3 = level1Item.subpermission.some(
        (sub) => sub.subpermission && sub.subpermission.length > 0
      );

      if (hasLevel3) {
        // Create subSections structure (level 2 items that may have level 3)
        section.subSections = level1Item.subpermission.map((level2Item) => {
          const subSection = {
            id: level2Item.permission_id,
            title: level2Item.section_name,
            permissionId: level2Item.permission_id,
          };

          // If level 2 has level 3 subpermissions, create items from level 3
          if (level2Item.subpermission && level2Item.subpermission.length > 0) {
            subSection.items = level2Item.subpermission.map((level3Item) => ({
              id: level3Item.permission_id,
              title: level3Item.section_name,
              permissionId: level3Item.permission_id,
            }));
          } else {
            // Level 2 item without subpermissions - represent itself as a single item
            subSection.items = [
              {
                id: level2Item.permission_id,
                title: level2Item.section_name,
                permissionId: level2Item.permission_id,
              },
            ];
          }

          return subSection;
        });
      } else {
        // All level 2 items are direct items (no level 3)
        section.items = level1Item.subpermission.map((level2Item) => ({
          id: level2Item.permission_id,
          title: level2Item.section_name,
          permissionId: level2Item.permission_id,
        }));
      }
    } else {
      // Level 1 item without subpermissions
      section.items = [];
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

  // When opened from User page: list comes from full permissionsList; loading = list loading
  const isLoadingPermissions = isLoadingPermissionsList;

  // Fetch full permissions list when modal opens (both Permission page and User page)
  useEffect(() => {
    if (showModal) {
      fetchPermissionsList();
      if (!isUserPermissionMode) {
        if (isEditMode && editData) {
          const roleId = editData.role_id ?? editData._id ?? editData.id;
          setRoleText(editData.role ?? "");
          setRoleDescription(editData.description ?? "");
          setSelectedPermissions(new Set());
          if (roleId) {
            fetchRolePermission({ role_id: roleId }).then((data) => {
              if (!data) return;
              if (data?.description !== undefined)
                setRoleDescription(data.description ?? "");
              if (data?.permissions?.length) {
                const ids = new Set(
                  data.permissions.map((p) => p.permission_id ?? p.id ?? p)
                );
                setSelectedPermissions(ids);
              } else if (Array.isArray(data?.permission_id)) {
                setSelectedPermissions(new Set(data.permission_id));
              } else if (Array.isArray(data)) {
                const allowed = data
                  .filter((p) => p.is_allowed === "1" || p.is_allowed === 1)
                  .map((p) => p.permission_id ?? p.id ?? p);
                setSelectedPermissions(new Set(allowed));
              }
            });
          }
        } else {
          setRoleText("");
          setRoleDescription("");
          setSelectedPermissions(new Set());
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
            .map((p) => p.permission_id)
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
      if (checked) newSet.add(permissionId);
      else newSet.delete(permissionId);
      return newSet;
    });
  };

  // Handle form submission (Permission page only; user mode is view/edit of user permissions)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUserPermissionMode) return;

    const role = roleText?.trim();
    if (!role) {
      showError("Please enter a role");
      return;
    }

    if (selectedPermissions.size === 0) {
      showError("Please select at least one permission");
      return;
    }

    const permissionIdArray = Array.from(selectedPermissions);
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
  const isPermissionSelected = (permissionId) => selectedPermissions.has(permissionId);

  // Handle section-level toggle (select/deselect all children)
  const handleSectionToggle = (section, checked) => {
    const permissionIds = [];

    // Collect all permission IDs from this section
    if (section.items && section.items.length > 0) {
      section.items.forEach((item) => {
        permissionIds.push(item.permissionId || item.id);
      });
    }

    if (section.subSections && section.subSections.length > 0) {
      section.subSections.forEach((sub) => {
        permissionIds.push(sub.permissionId || sub.id);
        if (sub.items && sub.items.length > 0) {
          sub.items.forEach((item) => {
            permissionIds.push(item.permissionId || item.id);
          });
        }
      });
    }

    // Also include the section itself
    permissionIds.push(section.permissionId || section.id);

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
    const collapseId = `permission_${section.id}`;
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
                "data-bs-target": `#${collapseId}`,
                "aria-expanded": "false",
                "aria-controls": collapseId,
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
            <div className="collapse" id={collapseId}>
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
      const permissionIds = [subPermissionId];
      if (sub.items && sub.items.length > 0) {
        sub.items.forEach((item) => {
          permissionIds.push(item.permissionId || item.id);
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
                  className="form-control"
                  id="floatingRole"
                  placeholder="Role"
                  value={
                    isUserPermissionMode && selectedUser
                      ? selectedUser.role ?? userPermissions?.[0]?.role ?? ""
                      : roleText
                  }
                  readOnly={isUserPermissionMode && selectedUser}
                  onChange={(e) => setRoleText(e.target.value)}
                />
                <label htmlFor="floatingRole">Role *</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  id="floatingDesc"
                  placeholder="Description"
                  style={{ height: "58px", resize: "none" }}
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
  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => closeModal?.(null)}
        disabled={isBeingUpdated}
      >
        Close
      </button>

      {!isUserPermissionMode && (
        <button
          type="submit"
          className="btn btn-primary"
          form="permissionForm"
          disabled={isBeingUpdated || !roleText?.trim()}
        >
          {isBeingUpdated ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );

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

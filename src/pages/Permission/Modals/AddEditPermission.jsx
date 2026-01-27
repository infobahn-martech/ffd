import { useEffect, useMemo, useState } from 'react';
import CustomModal from '../../../components/CustomModal';
import icon from '../../../assets/images/icon-chevToggle.svg';
import usePermissionReducer from '../../../store/PermissionReducer';
import useRoleReducer from '../../../store/RoleReducer';
import useAlertReducer from '../../../store/AlertReducer';
import '../../../design/scss/add-permissions.scss';

// Unique toggle ID builder
const buildToggleId = (...parts) => `toggle_${parts.join('_')}`;

// -------------------------------------------
//  TRANSFORM API RESPONSE TO COMPONENT STRUCTURE
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
export function PermissionModal({ showModal, closeModal }) {
  const {
    permissionsList,
    isLoadingPermissions,
    fetchPermissionsList,
    assignRolePermission,
    isBeingUpdated
  } = usePermissionReducer();

  const { roles, fetchRoles, isLoading: isLoadingRoles } = useRoleReducer();
  const { error: showError } = useAlertReducer();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  // Fetch permissions and roles when modal opens
  useEffect(() => {
    if (showModal) {
      fetchPermissionsList();
      fetchRoles({ params: { page: 1, limit: 100 } });
      // Reset form when modal opens
      setSelectedRoleId('');
      setSelectedPermissions(new Set());
    }
  }, [showModal, fetchPermissionsList, fetchRoles]);

  // Transform API data to component structure
  const PERMISSION_SECTIONS = useMemo(() => {
    return transformPermissionsData(permissionsList);
  }, [permissionsList]);

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoleId) {
      showError('Please select a role');
      return;
    }

    if (selectedPermissions.size === 0) {
      showError('Please select at least one permission');
      return;
    }

    const permissionIdArray = Array.from(selectedPermissions);

    await assignRolePermission({
      role_id: selectedRoleId,
      permission_id: permissionIdArray,
      cb: () => {
        closeModal?.(null);
      },
    });
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
        if (checked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
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
            {...((hasSub || hasItems)
              ? {
                'data-bs-toggle': 'collapse',
                'data-bs-target': `#${collapseId}`,
                'aria-expanded': 'false',
                'aria-controls': collapseId,
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
          if (checked) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
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
                onChange={(e) => handlePermissionChange(itemPermissionId, e.target.checked)}
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
                onChange={(e) => handlePermissionChange(itemPermissionId, e.target.checked)}
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
          <div className="permInputs">
            <div className="form-floating desig-inp">
              <select
                className="form-select"
                id="floatingRole"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {roles && roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingRole">Role *</label>
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
      <button
        type="submit"
        className="btn btn-primary"
        form="permissionForm"
        disabled={isBeingUpdated || !selectedRoleId}
      >
        {isBeingUpdated ? 'Saving...' : 'Save'}
      </button>
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
      header={<h1 className="modal-title fs-5">Add Designation and Permission</h1>}
    />
  );
}

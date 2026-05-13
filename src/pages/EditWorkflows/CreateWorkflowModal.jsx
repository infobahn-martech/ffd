import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../structure/SideNav/components/AddDashboardModal.scss';
import workflowService from '../../services/workflowService';
import PremiumSelect from '../../components/form/PremiumSelect';

const DEFAULT_ROLE_OPTION = '__select_role__';

const CreateWorkflowModal = ({ show, onClose, onSave, isSaving = false }) => {
  const [workflowName, setWorkflowName] = useState('');
  const [roleId, setRoleId] = useState(DEFAULT_ROLE_OPTION);
  const [roles, setRoles] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setWorkflowName('');
      setRoleId(DEFAULT_ROLE_OPTION);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    let isMounted = true;
    setIsRolesLoading(true);

    workflowService
      .getUserRoles()
      .then((res) => {
        if (!isMounted) return;
        const responseData = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        const normalizedRoles = responseData.map((item) => ({
          role_id: item?.role_id ?? '',
          role: item?.role ?? 'N/A',
        }));
        setRoles(normalizedRoles);
      })
      .catch(() => {
        if (isMounted) setRoles([]);
      })
      .finally(() => {
        if (isMounted) setIsRolesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workflowName.trim() || roleId === DEFAULT_ROLE_OPTION || isSaving || isRolesLoading) return;
    if (onSave) {
      onSave({
        workflow_name: workflowName.trim(),
        role_id: roleId,
      });
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setWorkflowName('');
    setRoleId(DEFAULT_ROLE_OPTION);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="add-dashboard-modal"
      centered
      backdrop="static"
      backdropClassName="add-dashboard-modal-backdrop"
      dialogClassName="add-dashboard-modal-dialog"
      contentClassName="add-dashboard-modal-content"
    >
      <form onSubmit={handleSubmit} className="add-dashboard-form">
        <div className="add-dashboard-modal-header">
          <h2 className="add-dashboard-modal-title" id="create-workflow-modal-title">
            New workflow
          </h2>
          <button
            type="button"
            className="add-dashboard-modal-close"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <FiX size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="add-dashboard-modal-body">
          <div className="add-dashboard-field">
            <label htmlFor="workflowName" className="add-dashboard-label">
              Name
            </label>
            <input
              type="text"
              id="workflowName"
              className="add-dashboard-input"
              placeholder="Enter workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="add-dashboard-field">
            <label htmlFor="workflowRole" className="add-dashboard-label">
              Role
            </label>
            <PremiumSelect
              value={roleId === DEFAULT_ROLE_OPTION ? '' : String(roleId)}
              onChange={(e) => {
                const v = e.target.value;
                setRoleId(v === '' ? DEFAULT_ROLE_OPTION : v);
              }}
              options={roles.map((roleOption) => ({
                value: String(roleOption.role_id ?? ''),
                label: String(roleOption.role ?? ''),
              }))}
              placeholder={isRolesLoading ? 'Loading roles...' : 'Select role'}
              searchPlaceholder="Search role..."
              disabled={isSaving || isRolesLoading}
              className="add-dashboard-premium-select"
              menuPortalTarget={
                typeof document !== 'undefined' ? document.body : undefined
              }
              menuClassName="user-modal-premium-select-menu"
            />
            {!isRolesLoading && roles.length === 0 ? (
              <div className="add-dashboard-field-hint">No roles found.</div>
            ) : null}
          </div>
        </div>

        <div className="add-dashboard-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="add-dashboard-btn add-dashboard-btn--text"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-dashboard-btn add-dashboard-btn--text"
            disabled={!workflowName.trim() || roleId === DEFAULT_ROLE_OPTION || isSaving || isRolesLoading}
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkflowModal;

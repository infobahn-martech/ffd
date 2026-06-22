import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../design/scss/structure/side-nav/AddDashboardModal.scss';
import workflowService from '../../services/workflowService';
import PremiumSelect from '../../components/form/PremiumSelect';

/** API default row: `{ role_id: "", role: "N/A" }` — valid selection, posted as empty string */
const DEFAULT_ROLE_ID = '';

const WORKFLOW_NAME_MAX_LEN = 200;

/** @returns {string|null} */
function validateWorkflowName(raw) {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length > WORKFLOW_NAME_MAX_LEN) {
    return `Name must be at most ${WORKFLOW_NAME_MAX_LEN} characters.`;
  }
  return null;
}

const CreateWorkflowModal = ({ show, onClose, onSave, isSaving = false }) => {
  const [workflowName, setWorkflowName] = useState('');
  const [nameError, setNameError] = useState('');
  const [roleId, setRoleId] = useState(DEFAULT_ROLE_ID);
  const [roles, setRoles] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setWorkflowName('');
      setNameError('');
      setRoleId(DEFAULT_ROLE_ID);
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
        normalizedRoles.sort((a, b) => {
          const aEmpty = String(a.role_id ?? '').trim() === '';
          const bEmpty = String(b.role_id ?? '').trim() === '';
          if (aEmpty !== bEmpty) return aEmpty ? -1 : 1;
          return 0;
        });
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
    const err = validateWorkflowName(workflowName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError('');
    if (isSaving || isRolesLoading) return;
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
    setNameError('');
    setRoleId(DEFAULT_ROLE_ID);
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
              className={`add-dashboard-input${nameError ? ' add-dashboard-input--invalid' : ''}`}
              placeholder="Enter workflow name"
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value);
                if (nameError) setNameError('');
              }}
              disabled={isSaving}
              maxLength={WORKFLOW_NAME_MAX_LEN}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'workflowName-error' : undefined}
              autoFocus
            />
            {nameError ? (
              <div id="workflowName-error" className="add-dashboard-field-error" role="alert">
                {nameError}
              </div>
            ) : null}
          </div>

          <div className="add-dashboard-field">
            <label htmlFor="workflowRole" className="add-dashboard-label">
              Role
            </label>
            <PremiumSelect
              value={String(roleId)}
              onChange={(e) => {
                const v = e.target?.value;
                setRoleId(v === undefined || v === null ? DEFAULT_ROLE_ID : String(v));
              }}
              options={roles.map((roleOption) => ({
                value: String(roleOption.role_id ?? ''),
                label: String(roleOption.role ?? '') || 'N/A',
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
            disabled={isSaving || isRolesLoading}
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkflowModal;

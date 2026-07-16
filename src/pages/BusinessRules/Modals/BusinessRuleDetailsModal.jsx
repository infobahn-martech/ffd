import { useEffect, useState } from 'react';
import CustomModal from '../../../components/CustomModal';
import useBusinessRuleReducer from '../../../store/BusinessRuleReducer';
import useCommonReducer from '../../../store/CommonReducer';
import '../../../design/scss/business-rule-details-modal.scss';

const toTagsText = (tags) => {
  if (Array.isArray(tags)) return tags.join(', ');
  if (typeof tags === 'string') return tags;
  return '';
};

const BusinessRuleDetailsModal = ({ show, businessRuleId, onClose }) => {
  const { getBusinessRuleById, businessRuleDetails, isLoadingBusinessRuleDetails, resetBusinessRuleDetails } =
    useBusinessRuleReducer((s) => s);
  const { users, getUsers } = useCommonReducer((s) => s);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [executionOrder, setExecutionOrder] = useState('');
  const [disallowRuleActionTrigger, setDisallowRuleActionTrigger] = useState(false);

  useEffect(() => {
    if (!show || !businessRuleId) return;
    getBusinessRuleById(businessRuleId);
    getUsers({ params: { page: 1, limit: 1000 } });
  }, [show, businessRuleId]);

  useEffect(() => {
    if (!show) resetBusinessRuleDetails();
  }, [show]);

  useEffect(() => {
    if (!businessRuleDetails) return;
    setName(businessRuleDetails.rule_name ?? '');
    setDescription(businessRuleDetails.description ?? '');
    setTagsText(toTagsText(businessRuleDetails.tags));
    setIsEnabled(String(businessRuleDetails.is_enabled) === '1');
    setExecutionOrder(businessRuleDetails.execution_order ?? '');
    setDisallowRuleActionTrigger(String(businessRuleDetails.disallow_rule_action_trigger) === '1');
  }, [businessRuleDetails]);

  const owner = users.find((u) => String(u.user_id) === String(businessRuleDetails?.owner_user_id));

  const renderHeader = () => <h1 className="modal-title">Business Rule Details</h1>;

  const renderBody = () => (
    <div className="modal-body business-rule-details-body">
      {isLoadingBusinessRuleDetails ? (
        <div className="business-rule-details-loading">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <form>
          <div className="mb-3">
            <label className="form-label">Rule name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Tags</label>
              <input
                type="text"
                className="form-control"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Execution order</label>
              <input
                type="number"
                className="form-control"
                value={executionOrder}
                onChange={(e) => setExecutionOrder(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Owner</label>
            <input
              type="text"
              className="form-control"
              value={owner?.name ?? businessRuleDetails?.owner_user_id ?? ''}
              disabled
            />
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="brd-is-enabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="brd-is-enabled">Enabled</label>
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="brd-disallow-trigger"
              checked={disallowRuleActionTrigger}
              onChange={(e) => setDisallowRuleActionTrigger(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="brd-disallow-trigger">
              Disallow this rule&apos;s actions from triggering other rules
            </label>
          </div>

          <p className="business-rule-details-save-note">
            Saving changes isn&apos;t wired up yet — the backend update endpoint hasn&apos;t been confirmed.
          </p>
        </form>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={onClose}>
        Close
      </button>
      <button type="button" className="btn btn-primary" disabled title="Update endpoint not yet available">
        Save
      </button>
    </div>
  );

  return (
    <CustomModal
      className="business-rule-details-modal"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!show}
      closeModal={onClose}
      header={renderHeader()}
      body={renderBody()}
      footer={renderFooter()}
    />
  );
};

export default BusinessRuleDetailsModal;

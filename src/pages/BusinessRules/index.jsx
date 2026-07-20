import { useState, useEffect } from 'react';
import useBusinessRuleReducer from '../../store/BusinessRuleReducer';
import BusinessRulesModal from '../../structure/SideNav/components/BusinessRulesModal';
import BusinessRuleDetailsModal from './Modals/BusinessRuleDetailsModal';
import './business-rules-page.scss';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
];

const OwnerCell = ({ owner }) => {
  if (!owner) return <span className="br-deleted-user">Deleted user</span>;
  const name = typeof owner === 'object' ? (owner?.name ?? owner?.username ?? '') : owner;
  const avatar = typeof owner === 'object' ? owner?.avatar : null;
  if (!name) return <span className="br-deleted-user">Deleted user</span>;
  return (
    <div className="br-owner">
      {avatar ? (
        <img src={avatar} className="br-avatar" alt={name} />
      ) : (
        <div className="br-avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
      )}
      <span>{name}</span>
    </div>
  );
};

const BoardNameCell = ({ boards }) => {
  const items = boards ?? [];
  if (!Array.isArray(items) || items.length === 0) return <span>-</span>;
  return (
    <>
      {items.map((b, i) => (
        <span key={i} className="br-board-link">
          {typeof b === 'object' ? b?.name : b}
          {i < items.length - 1 && ', '}
        </span>
      ))}
    </>
  );
};

const BusinessRules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);

  const { getBusinessRules, businessRules, businessRulesCount, isLoadingBusinessRules } =
    useBusinessRuleReducer((s) => s);

  // UI-only toggle until the backend endpoint is ready - not persisted, keyed by rule id.
  const [localStatusOverrides, setLocalStatusOverrides] = useState({});

  useEffect(() => {
    const is_enabled = filter === 'enabled' ? 1 : filter === 'disabled' ? 0 : undefined;
    getBusinessRules({ params: { page, per_page: limit, search: searchTerm || undefined, is_enabled } });
  }, [page, limit, searchTerm, filter]);

  const handleToggleStatus = (ruleId, currentValue) => {
    setLocalStatusOverrides((prev) => ({ ...prev, [ruleId]: !currentValue }));
  };

  const totalPages = Math.max(1, Math.ceil(businessRulesCount / limit));

  return (
    <div className="page-body">
      <div className="br-page">
        <div className="br-toolbar">
          <div className="br-toolbar-left">
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle br-filter-btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? 'All'}
              </button>
              <ul className="dropdown-menu">
                {FILTER_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => { setFilter(opt.value); setPage(1); }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <input
              type="text"
              className="form-control br-search-input"
              placeholder="Filter by business rule name, ID, owner, t"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <button
            type="button"
            className="btn btn-link br-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add new rule
          </button>
        </div>

        <div className="br-table-wrapper">
          <table className="br-table">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                <th>ID</th>
                <th>NAME</th>
                <th>OWNER</th>
                <th>BOARD NAME</th>
                <th>EXECUTION ORDER</th>
                <th>TAGS</th>
                <th>SHARED WITH</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {isLoadingBusinessRules ? (
                <tr>
                  <td colSpan={9} className="br-loading">Loading...</td>
                </tr>
              ) : businessRules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="br-empty">No business rules found</td>
                </tr>
              ) : (
                businessRules.map((rule) => {
                  const ruleId = rule?.business_rule_id ?? rule?.id;
                  const name = rule?.name ?? rule?.rule_name ?? '-';
                  const execOrder = rule?.execution_order ?? '-';
                  const tags = rule?.tags || '-';
                  const isEnabled = localStatusOverrides[ruleId] ?? (String(rule?.status) === '1');
                  const sharedWith = Array.isArray(rule?.shared_with) && rule.shared_with.length > 0
                    ? rule.shared_with.map((s) => (typeof s === 'object' ? s?.name : s)).join(', ')
                    : '-';

                  return (
                    <tr key={ruleId}>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleStatus(ruleId, isEnabled)}
                          />
                        </div>
                      </td>
                      <td>{ruleId}</td>
                      <td><span className="br-rule-name">{name}</span></td>
                      <td><OwnerCell owner={rule?.owner} /></td>
                      <td><BoardNameCell boards={rule?.board_name} /></td>
                      <td>{execOrder}</td>
                      <td>{tags}</td>
                      <td>{sharedWith}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="br-action-btn"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            &#8942;
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button
                                className="dropdown-item"
                                type="button"
                                onClick={() => { setSelectedRuleId(ruleId); setShowDetailsModal(true); }}
                              >
                                Edit
                              </button>
                            </li>
                            <li><button className="dropdown-item text-danger" type="button">Delete</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="br-pagination">
            <div className="br-pagination-controls">
              <select
                className="br-page-select"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                className="br-page-btn"
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
              >
                &gt;
              </button>
            </div>
            <span>
              Available business rules {businessRulesCount}
            </span>
          </div>
        </div>
      </div>

      <BusinessRulesModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <BusinessRuleDetailsModal
        show={showDetailsModal}
        businessRuleId={selectedRuleId}
        onClose={() => { setShowDetailsModal(false); setSelectedRuleId(null); }}
      />
    </div>
  );
};

export default BusinessRules;

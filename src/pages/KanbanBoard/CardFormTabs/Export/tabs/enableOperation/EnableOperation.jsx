import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiAnchor,
  FiPackage,
  FiDollarSign,
  FiMail,
  FiCheckSquare,
  FiClock,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { FormSelect } from "../../../Import/tabs/husbandry/components/Husbandry.components";
import DynamicIcon from "../../../../../../structure/SideNav/components/DynamicIcon";
import { mapBackendIconNameToIconKey } from "../../../../../../store/KanbanManagementReducer";
import useEnableOperationReducer from "../../../../../../store/EnableOperationReducer";
import callFileService from "../../../../../../services/callFileService";
import {
  unwrapListResponse,
  mapOperatorsToOptions,
} from "../../../../../../shared/helpers/callFileFormOptions";
import { formatDisplayDateTime } from "../../../../../../shared/helpers/dateTimeFieldUtils";
import "../../../../../../design/scss/general.scss";
import "../../../../../../design/css/common/CardForm.css";
import "../../../../../../design/scss/enableOperation.scss";

const getCallId = (card, formValues) =>
  formValues?.call_id ?? formValues?.callId ?? card?.call_id ?? card?.callId ?? null;

const LAUNCH_HIRE_OPTIONS = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

function SectionHeader({ icon, title, trailing }) {
  return (
    <div className="eo-section-header">
      <div className="eo-section-heading">
        <span className="eo-section-icon-box">{icon}</span>
        <h3 className="eo-section-title">{title}</h3>
      </div>
      {trailing || null}
    </div>
  );
}

SectionHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  trailing: PropTypes.node,
};

function ReadOnlyField({ label, value, fullWidth = false, isLink = false }) {
  const isEmpty = value === undefined || value === null || String(value).trim() === "";
  return (
    <div className={`eo-field cf-field ${fullWidth ? "eo-field--full" : ""}`.trim()}>
      <label>{label}</label>
      <div className={`eo-readonly-value ${isEmpty ? "eo-readonly-value--muted" : ""}`.trim()}>
        {isEmpty ? (
          "—"
        ) : isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value} <FiArrowUpRight size={12} />
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

ReadOnlyField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fullWidth: PropTypes.bool,
  isLink: PropTypes.bool,
};

function EmailChipList({ emails }) {
  const list = Array.isArray(emails) ? emails.filter((e) => e?.email) : [];
  if (list.length === 0) {
    return (
      <p className="eo-empty-state">
        <FiMail size={12} /> No emails on record.
      </p>
    );
  }
  return (
    <div className="eo-chip-list">
      {list.map((item, index) => (
        <span className="eo-chip" key={item.email_id ?? `${item.email}-${index}`}>
          {item.email}
        </span>
      ))}
    </div>
  );
}

EmailChipList.propTypes = {
  emails: PropTypes.arrayOf(
    PropTypes.shape({
      email_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
    })
  ),
};

// checklists/card_type/card_blocker/card_sticker/card_tag can legitimately
// come back empty/null when nothing's assigned to a call (confirmed via a
// live get_call_detail response 2026-07-28) — render an empty state rather
// than erroring.
function ChecklistChips({ checklists }) {
  const list = Array.isArray(checklists) ? checklists : [];
  if (list.length === 0) {
    return (
      <p className="eo-empty-state">
        <FiCheckSquare size={12} /> No checklists assigned.
      </p>
    );
  }
  return (
    <div className="eo-chip-list">
      {list.map((item) => (
        <span className="eo-chip" key={item.checklist_type_id}>
          {item.checklist_name}
        </span>
      ))}
    </div>
  );
}

ChecklistChips.propTypes = {
  checklists: PropTypes.arrayOf(
    PropTypes.shape({
      checklist_type_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      checklist_name: PropTypes.string,
    })
  ),
};

function TimeObjectsList({ timeObjects }) {
  // API has been observed returning this nested (an array containing one
  // array of rows) rather than flat — .flat() normalizes either shape.
  // Rows can also repeat the same time_object_id, so the row key includes
  // the array index too.
  const list = Array.isArray(timeObjects) ? timeObjects.flat() : [];
  if (list.length === 0) {
    return (
      <p className="eo-empty-state">
        <FiClock size={12} /> No time objects recorded.
      </p>
    );
  }
  return (
    <div className="eo-time-objects-list">
      {list.map((item, index) => (
        <div className="eo-time-object-row" key={`${item.time_object_id}-${index}`}>
          <span className="eo-time-object-name">{item.time_object}</span>
          <span className="eo-time-object-value">{item.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

TimeObjectsList.propTypes = {
  timeObjects: PropTypes.array,
};

const CARD_META_KEYS = [
  { key: "card_type", idKey: "card_type_id", nameKey: "type_name", label: "Type" },
  { key: "card_blocker", idKey: "card_blocker_id", nameKey: "blocker_name", label: "Blocker" },
  { key: "card_sticker", idKey: "card_sticker_id", nameKey: "sticker_name", label: "Sticker" },
  { key: "card_tag", idKey: "tag_id", nameKey: "tag_name", label: "Tag" },
];

function CardMetaChips({ details }) {
  const chips = CARD_META_KEYS.map(({ key, idKey, nameKey, label }) => {
    const meta = details?.[key];
    if (!meta || typeof meta !== "object") return null;
    const id = meta[idKey];
    const name = meta[nameKey];
    if (id == null && !name) return null;
    return {
      key,
      label,
      name: name || label,
      colorCode: meta.color_code,
      iconKey: mapBackendIconNameToIconKey(meta.icon_name),
    };
  }).filter(Boolean);

  if (chips.length === 0) {
    return (
      <p className="eo-empty-state">
        <FiTag size={12} /> No card metadata assigned.
      </p>
    );
  }

  return (
    <div className="eo-chip-list">
      {chips.map((chip) => (
        <span
          className="eo-chip eo-chip--meta"
          key={chip.key}
          style={{ "--eo-chip-color": chip.colorCode || "#6366f1" }}
        >
          <span className="eo-chip-icon">
            <DynamicIcon iconKey={chip.iconKey} size={11} />
          </span>
          <span className="eo-chip-label">{chip.label}</span>
          {chip.name}
        </span>
      ))}
    </div>
  );
}

CardMetaChips.propTypes = {
  details: PropTypes.object,
};

function EnableOperation({ card, formValues }) {
  const callId = getCallId(card, formValues);

  const details = useEnableOperationReducer((state) => state.details);
  const isLoadingDetails = useEnableOperationReducer((state) => state.isLoadingDetails);
  const isSaving = useEnableOperationReducer((state) => state.isSaving);
  const getEnableOperationDetails = useEnableOperationReducer((state) => state.getEnableOperationDetails);
  const saveEnableOperation = useEnableOperationReducer((state) => state.saveEnableOperation);

  const [ownerOptions, setOwnerOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);

  const [ownerId, setOwnerId] = useState("");
  const [assignedOperatorId, setAssignedOperatorId] = useState("");
  const [launchHire, setLaunchHire] = useState("");

  // "saving" | "saved" | "error" | "idle" — drives the inline save indicator
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    if (callId) {
      getEnableOperationDetails(callId);
    }
  }, [callId, getEnableOperationDetails]);

  useEffect(() => {
    if (!details) return;
    setOwnerId(details.owner_id != null ? String(details.owner_id) : "");
    setAssignedOperatorId(details.assigned_operator_id != null ? String(details.assigned_operator_id) : "");
    setLaunchHire(details.launch_hire != null ? String(details.launch_hire) : "");
  }, [details]);

  useEffect(() => {
    let cancelled = false;

    // Owner/Assigned Operator are the only fields on this tab needing a
    // dropdown option list — every other field the API returns already
    // comes back with its label resolved (e.g. `port`, `vessel_name`,
    // `main_billing_entity`), confirmed via a live get_call_detail response
    // on 2026-07-28, so no other master-data lookups are needed here.
    const loadMasterData = async () => {
      const [managers, operators] = await Promise.allSettled([
        callFileService.getAllManagers(),
        callFileService.getAllOperators(),
      ]);

      if (cancelled) return;

      if (managers.status === "fulfilled") setOwnerOptions(mapOperatorsToOptions(unwrapListResponse(managers.value?.data)));
      if (operators.status === "fulfilled") setOperatorOptions(mapOperatorsToOptions(unwrapListResponse(operators.value?.data)));
    };

    loadMasterData();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasBargeDetails = Boolean(
    details?.barge_type_id ||
      details?.barge_vessel_id ||
      details?.barge_vessel_owner ||
      details?.barge_vessel_principal ||
      details?.barge_vessel_name
  );

  const billingInstructionText = details?.billing_instruction_det || details?.billing_instruction || "";

  const billingEntityFieldsList = useMemo(() => {
    const fields = details?.billing_entity_fields;
    if (!fields || typeof fields !== "object") return [];
    return Object.entries(fields).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");
  }, [details?.billing_entity_fields]);

  const handleEnableOperation = useCallback(async () => {
    if (!callId) return;
    setSaveStatus("saving");
    try {
      await saveEnableOperation(callId, {
        call_id: callId,
        owner_id: ownerId || "",
        assigned_operator_id: assignedOperatorId || "",
        launch_hire: launchHire || "",
      });
      setSaveStatus("saved");
      getEnableOperationDetails(callId);
    } catch {
      setSaveStatus("error");
    }
  }, [callId, ownerId, assignedOperatorId, launchHire, saveEnableOperation, getEnableOperationDetails]);

  return (
    <div className="general-tab-content enable-operation-tab-content">
      <div className="cardform-body card-form-panel general-tab-body">
        {isLoadingDetails ? (
          <div className="text-center text-muted py-4">
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Loading operation details...
          </div>
        ) : null}

        <div className="eo-sections-wrapper">
          <div className="eo-ribbon">
            <span className="eo-ribbon-status">
              <FiCheckCircle size={14} /> Export Approved
            </span>
            <span className="eo-ribbon-item">
              <span className="eo-ribbon-item-label">Call ID</span>
              <span className="eo-ribbon-item-value">{details?.call_id ?? callId ?? "—"}</span>
            </span>
            <span className="eo-ribbon-item">
              <span className="eo-ribbon-item-label">Vessel</span>
              <span className="eo-ribbon-item-value">{details?.vessel_name || "—"}</span>
            </span>
            <span className="eo-ribbon-item">
              <span className="eo-ribbon-item-label">Port</span>
              <span className="eo-ribbon-item-value">{details?.port || "—"}</span>
            </span>
            <span className="eo-ribbon-item">
              <span className="eo-ribbon-item-label">Billing Entity</span>
              <span className="eo-ribbon-item-value">{details?.main_billing_entity || "—"}</span>
            </span>
          </div>

          <section className="eo-form-card">
            <SectionHeader icon={<FiCalendar size={15} />} title="Appointment Summary" />
            <div className="eo-fields-grid">
              <ReadOnlyField label="Port" value={details?.port} />
              <ReadOnlyField label="Appointment Type" value={details?.appointment_type} />
              <ReadOnlyField label="Appointment Received Date" value={formatDisplayDateTime(details?.appointment_received_date)} />
              <ReadOnlyField label="Main Billing Entity" value={details?.main_billing_entity} />
              <ReadOnlyField label="Service Requestor" value={details?.service_requestor_name} />
              <ReadOnlyField label="Service Requestor Email" value={details?.service_requestor_email} />
              <ReadOnlyField label="Appointment Email" value={details?.appointment_email} />
              <ReadOnlyField label="Appointment Email Attachment" value={details?.appointment_email_url} isLink />
              <ReadOnlyField label="Created By" value={details?.created_by} />
            </div>
          </section>

          <div className={hasBargeDetails ? "eo-row-2" : undefined}>
            <section className="eo-form-card">
              <SectionHeader icon={<FiAnchor size={15} />} title="Vessel Details" />
              <div className="eo-fields-grid">
                <ReadOnlyField label="Vessel Type" value={details?.vessel_type} />
                <ReadOnlyField label="Vessel" value={details?.vessel_name} />
                <ReadOnlyField label="Vessel Owner" value={details?.vessel_owner} />
                <ReadOnlyField label="Vessel Principal" value={details?.vessel_principal} />
              </div>
            </section>

            {hasBargeDetails ? (
              <section className="eo-form-card">
                <SectionHeader icon={<FiPackage size={15} />} title="Barge Details" />
                <div className="eo-fields-grid">
                  <ReadOnlyField label="Barge Type" value={details?.barge_type} />
                  <ReadOnlyField label="Barge Vessel" value={details?.barge_vessel_name} />
                  <ReadOnlyField label="Barge Owner" value={details?.barge_vessel_owner} />
                  <ReadOnlyField label="Barge Principal" value={details?.barge_vessel_principal} />
                </div>
              </section>
            ) : null}
          </div>

          <div className="eo-row-2">
            <section className="eo-form-card">
              <SectionHeader icon={<FiDollarSign size={15} />} title="Billing" />
              <div className="eo-fields-grid">
                <ReadOnlyField label="Billing Instruction" value={billingInstructionText} fullWidth />
                {billingEntityFieldsList.length > 0 ? (
                  billingEntityFieldsList.map(([key, value]) => (
                    <ReadOnlyField key={key} label={key} value={String(value)} />
                  ))
                ) : (
                  <div className="eo-field eo-field--full">
                    <label>Billing Entity Fields</label>
                    <p className="eo-empty-state">
                      <FiDollarSign size={12} /> Not available yet.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="eo-form-card">
              <SectionHeader icon={<FiMail size={15} />} title="Notification Emails" />
              <div className="eo-fields-grid">
                <div className="eo-field eo-field--full">
                  <label>Daily Report Emails</label>
                  <EmailChipList emails={details?.daily_report_emails} />
                </div>
                <div className="eo-field eo-field--full">
                  <label>Billing Instruction Emails</label>
                  <EmailChipList emails={details?.billing_instruction_emails} />
                </div>
              </div>
            </section>
          </div>

          <div className="eo-row-3">
            <section className="eo-form-card">
              <SectionHeader icon={<FiCheckSquare size={15} />} title="Checklists" />
              <ChecklistChips checklists={details?.checklists} />
            </section>

            <section className="eo-form-card">
              <SectionHeader icon={<FiClock size={15} />} title="Time Objects" />
              <TimeObjectsList timeObjects={details?.time_objects} />
            </section>

            <section className="eo-form-card">
              <SectionHeader icon={<FiTag size={15} />} title="Card Metadata" />
              <CardMetaChips details={details} />
            </section>
          </div>

          <section className="eo-form-card eo-form-card--action">
            <SectionHeader
              icon={<FiUsers size={15} />}
              title="Operation Assignment"
              trailing={
                <>
                  {saveStatus === "saving" ? (
                    <span className="eo-save-status eo-save-status--saving">
                      <FiLoader size={13} className="eo-save-status-spin" /> Saving…
                    </span>
                  ) : null}
                  {saveStatus === "saved" ? (
                    <span className="eo-save-status eo-save-status--saved">
                      <FiCheckCircle size={13} /> Operation enabled
                    </span>
                  ) : null}
                  {saveStatus === "error" ? (
                    <span className="eo-save-status eo-save-status--error">
                      <FiAlertCircle size={13} /> Couldn't save changes
                    </span>
                  ) : null}
                </>
              }
            />
            <div className="eo-fields-grid">
              <div className="eo-field cf-field">
                <label>Owner</label>
                <FormSelect
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  options={ownerOptions}
                  placeholder="Select owner..."
                />
              </div>
              <div className="eo-field cf-field">
                <label>Assigned Operator</label>
                <FormSelect
                  value={assignedOperatorId}
                  onChange={(e) => setAssignedOperatorId(e.target.value)}
                  options={operatorOptions}
                  placeholder="Select operator..."
                />
              </div>
              <div className="eo-field cf-field">
                <label>Launch / Hire</label>
                <FormSelect
                  value={launchHire}
                  onChange={(e) => setLaunchHire(e.target.value)}
                  options={LAUNCH_HIRE_OPTIONS}
                  placeholder="Select..."
                />
              </div>
            </div>
            <div className="eo-enable-action-row">
              <button
                type="button"
                className="eo-enable-btn"
                onClick={handleEnableOperation}
                disabled={isSaving || !callId}
              >
                <FiCheckCircle size={18} />
                Enable Operation
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

EnableOperation.propTypes = {
  card: PropTypes.shape({
    call_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  formValues: PropTypes.shape({
    call_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default EnableOperation;

import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import DateTimePickerField from "../../../shared/components/DateTimePickerField";
import "../../../../../../design/scss/general.scss";
import "../../../../../../design/scss/approval.scss";

const VESSEL_SECTIONS = [
  { key: "vesselOwner", title: "Vessel Owner's" },
  { key: "vesselPrincipal", title: "Vessel Principal/Manager" },
  { key: "vesselCharterer", title: "Vessel Charterer" },
];

const VESSEL_AMOUNT_FIELDS = [
  { key: "totalFdaAmount", label: "Total FDA Amount", placeholder: "670,497.00" },
  { key: "totalFundReceived", label: "Total Fund Received", placeholder: "543,007.78" },
  { key: "balanceAmount", label: "Balance Amount", placeholder: "127,489.22" },
  { key: "previousOutstanding", label: "Previous Outstanding", placeholder: "0.00" },
  { key: "totalOutstanding", label: "Total Outstanding", placeholder: "0.00" },
];

const createEmptyVesselSection = () => ({
  totalFdaAmount: "",
  totalFundReceived: "",
  balanceAmount: "",
  previousOutstanding: "",
  totalOutstanding: "",
  daHead: "",
  managerComments: "",
});

const formatToday = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getInitialGeneralFields = (formValues, card) => ({
  date: formatToday(),
  requestedBy: formValues?.requested_by || formValues?.created_by || "",
  branch: formValues?.port_name || formValues?.port || "",
  vesselName: formValues?.vessel_name || card?.name || "",
  vesselEtdDate: "",
  vesselEtdTime: "",
  billingEntity: formValues?.billing_entity || "",
  remarks: "",
});

function ApprovalFormRow({ label, children, valueClassName = "" }) {
  return (
    <tr className="approval-form-row">
      <td className="approval-form-label">{label}</td>
      <td className="approval-form-colon">:</td>
      <td className={`approval-form-value ${valueClassName}`.trim()}>{children}</td>
    </tr>
  );
}

ApprovalFormRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  valueClassName: PropTypes.string,
};

function VesselSection({ sectionKey, title, values, onFieldChange }) {
  return (
    <>
      <tr className="approval-section-header">
        <td colSpan={3}>{title}</td>
      </tr>
      {VESSEL_AMOUNT_FIELDS.map(({ key, label, placeholder }) => (
        <ApprovalFormRow key={`${sectionKey}-${key}`} label={label}>
          <input
            type="text"
            value={values[key]}
            onChange={(e) => onFieldChange(sectionKey, key, e.target.value)}
            placeholder={placeholder}
          />
        </ApprovalFormRow>
      ))}
      <ApprovalFormRow label="DA Head" valueClassName="approval-cell-green">
        <input
          type="text"
          value={values.daHead}
          onChange={(e) => onFieldChange(sectionKey, "daHead", e.target.value)}
          placeholder="Enter DA Head comments"
        />
      </ApprovalFormRow>
      <ApprovalFormRow
        label="Manager - Offshore Marine Logistics"
        valueClassName="approval-cell-blue"
      >
        <input
          type="text"
          value={values.managerComments}
          onChange={(e) => onFieldChange(sectionKey, "managerComments", e.target.value)}
          placeholder="Enter manager comments"
        />
      </ApprovalFormRow>
    </>
  );
}

VesselSection.propTypes = {
  sectionKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  values: PropTypes.shape({
    totalFdaAmount: PropTypes.string,
    totalFundReceived: PropTypes.string,
    balanceAmount: PropTypes.string,
    previousOutstanding: PropTypes.string,
    totalOutstanding: PropTypes.string,
    daHead: PropTypes.string,
    managerComments: PropTypes.string,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

function Approval({ card, formValues }) {
  const [generalFields, setGeneralFields] = useState(() =>
    getInitialGeneralFields(formValues, card)
  );
  const [vesselSections, setVesselSections] = useState({
    vesselOwner: createEmptyVesselSection(),
    vesselPrincipal: createEmptyVesselSection(),
    vesselCharterer: createEmptyVesselSection(),
  });

  const handleGeneralChange = useCallback((field, value) => {
    setGeneralFields((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVesselFieldChange = useCallback((sectionKey, field, value) => {
    setVesselSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  }, []);

  return (
    <div className="general-tab-content approval-tab-content">
      <div className="approval-form-scroll">
        <table className="approval-credit-form" aria-label="Credit Approval Form">
          <tbody>
            <tr className="approval-form-title-row">
              <td colSpan={3}>CREDIT APPROVAL FORM</td>
            </tr>

            <ApprovalFormRow label="Date">
              <input
                type="text"
                value={generalFields.date}
                onChange={(e) => handleGeneralChange("date", e.target.value)}
                placeholder="DD-MMM-YYYY"
              />
            </ApprovalFormRow>

            <ApprovalFormRow label="Requested by">
              <input
                type="text"
                value={generalFields.requestedBy}
                onChange={(e) => handleGeneralChange("requestedBy", e.target.value)}
                placeholder="Requested by"
              />
            </ApprovalFormRow>

            <ApprovalFormRow label="Branch">
              <input
                type="text"
                value={generalFields.branch}
                onChange={(e) => handleGeneralChange("branch", e.target.value)}
                placeholder="Branch / Port"
              />
            </ApprovalFormRow>

            <ApprovalFormRow label="Vessel Name">
              <input
                type="text"
                value={generalFields.vesselName}
                onChange={(e) => handleGeneralChange("vesselName", e.target.value)}
                placeholder="Vessel name"
              />
            </ApprovalFormRow>

            <ApprovalFormRow label="Vessel's ETD">
              <DateTimePickerField
                dateValue={generalFields.vesselEtdDate}
                timeValue={generalFields.vesselEtdTime}
                onDateTimeChange={(value) => {
                  setGeneralFields((prev) => ({
                    ...prev,
                    vesselEtdDate: value.date,
                    vesselEtdTime: value.time,
                  }));
                }}
                dateFieldName="vessel_etd_date"
                timeFieldName="vessel_etd_time"
                placeholder="YYYY-MM-DD HH:mm"
                popperClassName="approval-datetime-popper"
              />
            </ApprovalFormRow>

            <ApprovalFormRow label="Billing entity">
              <input
                type="text"
                value={generalFields.billingEntity}
                onChange={(e) => handleGeneralChange("billingEntity", e.target.value)}
                placeholder="Billing entity"
              />
            </ApprovalFormRow>

            {VESSEL_SECTIONS.map(({ key, title }) => (
              <VesselSection
                key={key}
                sectionKey={key}
                title={title}
                values={vesselSections[key]}
                onFieldChange={handleVesselFieldChange}
              />
            ))}

            <tr className="approval-remarks-row">
              <td colSpan={3} className="approval-remarks-label">
                Remarks / recommendation from Credit Controller
              </td>
            </tr>
            <tr className="approval-remarks-row">
              <td colSpan={3} className="approval-remarks-area approval-cell-green">
                <textarea
                  value={generalFields.remarks}
                  onChange={(e) => handleGeneralChange("remarks", e.target.value)}
                  placeholder="Enter remarks / recommendation from Credit Controller"
                  rows={6}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

Approval.propTypes = {
  card: PropTypes.shape({
    name: PropTypes.string,
    call_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  formValues: PropTypes.shape({
    call_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requested_by: PropTypes.string,
    created_by: PropTypes.string,
    port_name: PropTypes.string,
    port: PropTypes.string,
    vessel_name: PropTypes.string,
    billing_entity: PropTypes.string,
  }),
};

export default Approval;

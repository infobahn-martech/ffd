import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import DateTimePickerField from "../../../shared/components/DateTimePickerField";
import "../../../../../../design/scss/general.scss";
import "../../../../../../design/css/common/CardForm.css";
import "../../../../../../design/scss/approval.scss";

const formatToday = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const createEmptyPartySection = () => ({
  details: "",
  vesselCountUnderAgency: "",
  outstandingBalanceSoa: "",
  latestPayment: "",
});

const getInitialBasicDetails = (formValues, card) => ({
  date: formatToday(),
  requestedBy: formValues?.requested_by || formValues?.created_by || "",
  branch: formValues?.port_name || formValues?.port || "",
  vesselName: formValues?.vessel_name || card?.name || "",
  vesselEtdDate: "",
  vesselEtdTime: "",
  billingEntity: formValues?.billing_entity || "",
});

function FormField({ label, children, className = "", fullWidth = false }) {
  return (
    <div
      className={`cf-field approval-field ${fullWidth ? "approval-field--full" : ""} ${className}`.trim()}
    >
      {label ? <label>{label}</label> : null}
      {children}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

function FormInput({ type = "text", value, onChange, placeholder, readOnly = false }) {
  return (
    <div className="cf-input">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
};

function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
}) {
  return (
    <div className={`cf-input approval-textarea-wrap ${className}`.trim()}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

FormTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string,
};

function PartySectionCard({ title, fields, values, onChange }) {
  return (
    <section className="approval-form-card approval-party-card">
      <h3 className="form-group-title">{title}</h3>
      <div className="approval-card-body approval-fields-stack">
        <FormField label={fields.detailsLabel}>
          <FormTextarea
            value={values.details}
            onChange={(e) => onChange("details", e.target.value)}
            placeholder={fields.detailsPlaceholder}
            rows={3}
          />
        </FormField>
        <FormField label={fields.vesselCountLabel}>
          <FormInput
            value={values.vesselCountUnderAgency}
            onChange={(e) => onChange("vesselCountUnderAgency", e.target.value)}
            placeholder={fields.vesselCountPlaceholder}
          />
        </FormField>
        <FormField label={fields.outstandingLabel}>
          <FormInput
            value={values.outstandingBalanceSoa}
            onChange={(e) => onChange("outstandingBalanceSoa", e.target.value)}
            placeholder={fields.outstandingPlaceholder}
          />
        </FormField>
        <FormField label={fields.latestPaymentLabel}>
          <FormInput
            value={values.latestPayment}
            onChange={(e) => onChange("latestPayment", e.target.value)}
            placeholder={fields.latestPaymentPlaceholder}
          />
        </FormField>
      </div>
    </section>
  );
}

PartySectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.shape({
    detailsLabel: PropTypes.string.isRequired,
    detailsPlaceholder: PropTypes.string,
    vesselCountLabel: PropTypes.string.isRequired,
    vesselCountPlaceholder: PropTypes.string,
    outstandingLabel: PropTypes.string.isRequired,
    outstandingPlaceholder: PropTypes.string,
    latestPaymentLabel: PropTypes.string.isRequired,
    latestPaymentPlaceholder: PropTypes.string,
  }).isRequired,
  values: PropTypes.shape({
    details: PropTypes.string,
    vesselCountUnderAgency: PropTypes.string,
    outstandingBalanceSoa: PropTypes.string,
    latestPayment: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

const VESSEL_OWNER_FIELDS = {
  detailsLabel: "Vessel Owner's details",
  detailsPlaceholder: "Enter vessel owner's details",
  vesselCountLabel: "No. of owner's vessel chartered under our agency",
  vesselCountPlaceholder: "Enter number of vessels",
  outstandingLabel: "Vessel Owners Outstanding Balance with SOA",
  outstandingPlaceholder: "Enter outstanding balance",
  latestPaymentLabel: "Latest payment received from vessel owners",
  latestPaymentPlaceholder: "Enter latest payment amount",
};

const VESSEL_PRINCIPAL_FIELDS = {
  detailsLabel: "Vessel Principal/Manager details",
  detailsPlaceholder: "Enter vessel principal/manager details",
  vesselCountLabel: "No. of vessel Principal/Manager under our agency",
  vesselCountPlaceholder: "Enter number of vessels",
  outstandingLabel: "Vessel Principal/Manager Outstanding Balance with SOA",
  outstandingPlaceholder: "Enter outstanding balance",
  latestPaymentLabel: "Latest payment received from Vessel Principal/Manager",
  latestPaymentPlaceholder: "Enter latest payment amount",
};

const VESSEL_CHARTERER_FIELDS = {
  detailsLabel: "Owner vessel chartered to / By",
  detailsPlaceholder: "Enter charterer details",
  vesselCountLabel: "Charterer no. of the vessel under our agency",
  vesselCountPlaceholder: "Enter number of vessels",
  outstandingLabel: "Charterers outstanding balance with SOA",
  outstandingPlaceholder: "Enter outstanding balance",
  latestPaymentLabel: "Latest payment received from charterer / client",
  latestPaymentPlaceholder: "Enter latest payment amount",
};

function Approval({ card, formValues }) {
  const [basicDetails, setBasicDetails] = useState(() =>
    getInitialBasicDetails(formValues, card)
  );
  const [vesselOwner, setVesselOwner] = useState(createEmptyPartySection);
  const [vesselPrincipal, setVesselPrincipal] = useState(createEmptyPartySection);
  const [vesselCharterer, setVesselCharterer] = useState(createEmptyPartySection);
  const [remarks, setRemarks] = useState("");
  const [managerComments, setManagerComments] = useState("");

  const handleBasicChange = useCallback((field, value) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVesselOwnerChange = useCallback((field, value) => {
    setVesselOwner((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVesselPrincipalChange = useCallback((field, value) => {
    setVesselPrincipal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVesselChartererChange = useCallback((field, value) => {
    setVesselCharterer((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="general-tab-content approval-tab-content">
      <div className="cardform-body card-form-panel general-tab-body">
        <div className="approval-sections-wrapper">
          <section className="approval-form-card approval-section--full">
            <h3 className="form-group-title">Basic Details</h3>
            <div className="approval-fields-grid approval-basic-fields-grid">
              <FormField label="Date">
                <FormInput
                  value={basicDetails.date}
                  onChange={(e) => handleBasicChange("date", e.target.value)}
                  placeholder="DD-MMM-YYYY"
                />
              </FormField>
              <FormField label="Requested by">
                <FormInput
                  value={basicDetails.requestedBy}
                  onChange={(e) => handleBasicChange("requestedBy", e.target.value)}
                  placeholder="Requested by"
                />
              </FormField>
              <FormField label="Branch">
                <FormInput
                  value={basicDetails.branch}
                  onChange={(e) => handleBasicChange("branch", e.target.value)}
                  placeholder="Branch / Port"
                />
              </FormField>
              <FormField label="Vessel Name">
                <FormInput
                  value={basicDetails.vesselName}
                  onChange={(e) => handleBasicChange("vesselName", e.target.value)}
                  placeholder="Vessel name"
                />
              </FormField>
              <FormField label="Vessel's ETD">
                <DateTimePickerField
                  dateValue={basicDetails.vesselEtdDate}
                  timeValue={basicDetails.vesselEtdTime}
                  onDateTimeChange={(value) => {
                    setBasicDetails((prev) => ({
                      ...prev,
                      vesselEtdDate: value.date,
                      vesselEtdTime: value.time,
                    }));
                  }}
                  dateFieldName="vessel_etd_date"
                  timeFieldName="vessel_etd_time"
                  placeholder="Select date and time"
                />
              </FormField>
              <FormField label="Billing entity">
                <FormInput
                  value={basicDetails.billingEntity}
                  onChange={(e) => handleBasicChange("billingEntity", e.target.value)}
                  placeholder="Billing entity"
                />
              </FormField>
            </div>
          </section>

          <div className="approval-party-cards-row">
            <PartySectionCard
              title="Vessel Owner's"
              fields={VESSEL_OWNER_FIELDS}
              values={vesselOwner}
              onChange={handleVesselOwnerChange}
            />

            <PartySectionCard
              title="Vessel Principal/Manager"
              fields={VESSEL_PRINCIPAL_FIELDS}
              values={vesselPrincipal}
              onChange={handleVesselPrincipalChange}
            />

            <PartySectionCard
              title="Vessel Charterer"
              fields={VESSEL_CHARTERER_FIELDS}
              values={vesselCharterer}
              onChange={handleVesselChartererChange}
            />
          </div>

          <section className="approval-form-card approval-section--full">
            <h3 className="form-group-title">Remarks / Recommendation</h3>
            <div className="approval-fields-stack">
              <FormField label="Remarks / recommendation from Credit Controller">
                <FormTextarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks / recommendation from Credit Controller"
                  rows={5}
                />
              </FormField>
            </div>
          </section>

          <section className="approval-form-card approval-section--full">
            <h3 className="form-group-title">Manager - Offshore Marine Logistics Comments</h3>
            <div className="approval-fields-stack">
              <FormField label="Manager - Offshore Marine Logistics comments">
                <FormTextarea
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  placeholder="Enter manager comments"
                  rows={5}
                  className="approval-textarea--blue"
                />
                <p className="approval-helper-text">
                  Require Digital Signature of OFM department Manager
                </p>
              </FormField>
            </div>
          </section>
        </div>
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

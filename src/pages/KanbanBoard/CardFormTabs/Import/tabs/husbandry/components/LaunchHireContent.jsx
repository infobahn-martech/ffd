import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import {
  FormSection,
  FormField,
  FormInput,
  FormSelect,
  ReactQuillEditor,
} from "./Husbandry.components";
import DateTimePickerField from "../../../../shared/components/DateTimePickerField";
import {
  LAUNCH_HIRE_LOCATION_OPTIONS,
  LAUNCH_HIRE_SERVICE_TYPES,
  LAUNCH_HIRE_SERVICE_TYPE_OPTIONS,
  LAUNCH_HIRE_PACKING_LIST_SERVICE_TYPES,
  LAUNCH_HIRE_CREW_MOVEMENT_OPTIONS,
} from "./Husbandry.constants";

// Strip HTML tags from rich text to detect an empty value
const isRichTextEmpty = (html) => {
  if (!html) return true;
  const text = String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
};

// Dummy parse used until a real excel parsing API is available
const buildDummyCrewPreviewRows = (fileName) => [
  { name: "John Smith", rank: "Master", nationality: "United Kingdom", passportNo: "UK4521987", seamanBookNo: "SB-001" },
  { name: "Maria Santos", rank: "Chief Cook", nationality: "Philippines", passportNo: "PH7890123", seamanBookNo: "SB-002" },
  { name: "Viktor Petrov", rank: "Chief Engineer", nationality: "Ukraine", passportNo: "UA3456789", seamanBookNo: "SB-003" },
].map((row) => ({ ...row, sourceFile: fileName }));

const LaunchHireContent = ({ formValues, handleChange, cardColor, card, onLaunchHireSaved }) => {
  const [errors, setErrors] = useState({});
  const crewFileInputRef = useRef(null);
  const packingFileInputRef = useRef(null);

  const setValue = (key, value) => {
    handleChange(key)({ target: { value } });
  };

  // Auto-populate Vessel Name / Billing Entity from the Master Card when available
  const resolvedVesselName = useMemo(
    () =>
      formValues.launchHireVesselName ||
      card?.vesselName ||
      formValues.vesselName ||
      "",
    [formValues.launchHireVesselName, formValues.vesselName, card?.vesselName]
  );

  const resolvedBillingEntity = useMemo(
    () =>
      formValues.launchHireBillingEntity ||
      card?.billingEntity ||
      card?.user ||
      formValues.billingEntity ||
      formValues.mainBillingEntity ||
      "",
    [
      formValues.launchHireBillingEntity,
      formValues.billingEntity,
      formValues.mainBillingEntity,
      card?.billingEntity,
      card?.user,
    ]
  );

  // Persist the autofilled read-only values into formValues so they are saved
  useEffect(() => {
    if (!formValues.launchHireVesselName && resolvedVesselName) {
      setValue("launchHireVesselName", resolvedVesselName);
    }
    if (!formValues.launchHireBillingEntity && resolvedBillingEntity) {
      setValue("launchHireBillingEntity", resolvedBillingEntity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedVesselName, resolvedBillingEntity]);

  const typeOfService = formValues.launchHireTypeOfService || "";
  const showCrewUpload = typeOfService === LAUNCH_HIRE_SERVICE_TYPES.CREW_CHANGE;
  const showPackingUpload = LAUNCH_HIRE_PACKING_LIST_SERVICE_TYPES.includes(typeOfService);
  const showImmigration = typeOfService === LAUNCH_HIRE_SERVICE_TYPES.IMMIGRATION_CLEARANCE;

  const crewPreviewRows = formValues.launchHireCrewPreviewRows || [];
  const immigrationBatches = formValues.launchHireImmigrationBatches || ["", ""];
  const crewMovementType = formValues.launchHireCrewMovementType || "";

  // The TB booking date/time is stored as a single combined value; split it for the picker
  const [bookingDatePart = "", bookingTimePart = ""] = (
    formValues.launchHireTbBookingDateTime || ""
  ).split(/[ T]/);

  const handleBookingDateTimeChange = ({ date, time }) => {
    const combined = date ? (time ? `${date} ${time}` : date) : "";
    setValue("launchHireTbBookingDateTime", combined);
    clearError("launchHireTbBookingDateTime");
  };

  // Ensure immigration clearance always starts with two batches
  useEffect(() => {
    if (showImmigration && (!formValues.launchHireImmigrationBatches || formValues.launchHireImmigrationBatches.length < 2)) {
      const next = formValues.launchHireImmigrationBatches
        ? [...formValues.launchHireImmigrationBatches]
        : [];
      while (next.length < 2) next.push("");
      setValue("launchHireImmigrationBatches", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImmigration]);

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleFieldChange = (key) => (event) => {
    handleChange(key)(event);
    clearError(key);
  };

  const handleCrewFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue("launchHireCrewExcelFile", file.name);
    setValue("launchHireCrewPreviewRows", buildDummyCrewPreviewRows(file.name));
  };

  const handlePackingFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue("launchHirePackingExcelFile", file.name);
  };

  const handleBatchChange = (index) => (event) => {
    const next = [...immigrationBatches];
    next[index] = event.target.value;
    setValue("launchHireImmigrationBatches", next);
  };

  const handleAddBatch = () => {
    setValue("launchHireImmigrationBatches", [...immigrationBatches, ""]);
  };

  const validate = () => {
    const nextErrors = {};
    if (!formValues.launchHireTbBookingDateTime) {
      nextErrors.launchHireTbBookingDateTime = "Date & Time for TB Booking is required.";
    }
    if (!resolvedVesselName) {
      nextErrors.launchHireVesselName = "Vessel name is required.";
    }
    if (!resolvedBillingEntity) {
      nextErrors.launchHireBillingEntity = "Billing entity is required.";
    }
    if (!formValues.launchHireLocation) {
      nextErrors.launchHireLocation = "Location is required.";
    }
    if (!formValues.launchHireTypeOfService) {
      nextErrors.launchHireTypeOfService = "Type of service is required.";
    }
    if (isRichTextEmpty(formValues.launchHireRemarks)) {
      nextErrors.launchHireRemarks = "Remarks are required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (typeof onLaunchHireSaved === "function") {
      onLaunchHireSaved();
    }
  };

  const errorClass = (key) => (errors[key] ? "has-error" : "");

  return (
    <div className="cardform-left-full launchhire-booking" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form launchhire-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Booking Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                  <FormField
                    label="Date & Time for TB Booking *"
                    className={errorClass("launchHireTbBookingDateTime")}
                  >
                    <DateTimePickerField
                      dateValue={bookingDatePart}
                      timeValue={bookingTimePart}
                      onDateTimeChange={handleBookingDateTimeChange}
                      dateFieldName="launchHireTbBookingDate"
                      timeFieldName="launchHireTbBookingTime"
                      hasError={Boolean(errors.launchHireTbBookingDateTime)}
                      placeholder="Select date and time"
                    />
                    {errors.launchHireTbBookingDateTime && (
                      <span className="cf-field-error">{errors.launchHireTbBookingDateTime}</span>
                    )}
                  </FormField>

                  <FormField
                    label="Vessel Name *"
                    className={errorClass("launchHireVesselName")}
                  >
                    <FormInput
                      type="text"
                      value={resolvedVesselName}
                      placeholder="Auto-populated from Master Card"
                      readOnly
                      onChange={() => {}}
                    />
                    {errors.launchHireVesselName && (
                      <span className="cf-field-error">{errors.launchHireVesselName}</span>
                    )}
                  </FormField>

                  <FormField
                    label="Billing Entity *"
                    className={errorClass("launchHireBillingEntity")}
                  >
                    <FormInput
                      type="text"
                      value={resolvedBillingEntity}
                      placeholder="Auto-populated from Master Card"
                      readOnly
                      onChange={() => {}}
                    />
                    {errors.launchHireBillingEntity && (
                      <span className="cf-field-error">{errors.launchHireBillingEntity}</span>
                    )}
                  </FormField>

                  <FormField label="Agent Name">
                    <FormInput
                      type="text"
                      value={formValues.launchHireAgentName || ""}
                      onChange={handleChange("launchHireAgentName")}
                      placeholder="Enter agent name..."
                    />
                  </FormField>

                  <div className="cgpass-remarks">
                    <FormField
                      label="Remarks *"
                      className={errorClass("launchHireRemarks")}
                    >
                      <ReactQuillEditor
                        value={formValues?.launchHireRemarks || ""}
                        onChange={handleFieldChange("launchHireRemarks")}
                        placeholder="Enter remarks..."
                        name="launchHireRemarks"
                      />
                      {errors.launchHireRemarks && (
                        <span className="cf-field-error">{errors.launchHireRemarks}</span>
                      )}
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Service Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                  <FormField
                    label="Location *"
                    className={errorClass("launchHireLocation")}
                  >
                    <FormSelect
                      value={formValues.launchHireLocation || ""}
                      onChange={handleFieldChange("launchHireLocation")}
                      options={LAUNCH_HIRE_LOCATION_OPTIONS}
                      placeholder="Select location..."
                      className={errors.launchHireLocation ? "is-invalid" : ""}
                    />
                    {errors.launchHireLocation && (
                      <span className="cf-field-error">{errors.launchHireLocation}</span>
                    )}
                  </FormField>

                  <FormField
                    label="Type of Service *"
                    className={errorClass("launchHireTypeOfService")}
                  >
                    <FormSelect
                      value={formValues.launchHireTypeOfService || ""}
                      onChange={handleFieldChange("launchHireTypeOfService")}
                      options={LAUNCH_HIRE_SERVICE_TYPE_OPTIONS}
                      placeholder="Select type of service..."
                      className={errors.launchHireTypeOfService ? "is-invalid" : ""}
                    />
                    {errors.launchHireTypeOfService && (
                      <span className="cf-field-error">{errors.launchHireTypeOfService}</span>
                    )}
                  </FormField>

                  {showCrewUpload && (
                    <div className="launchhire-dynamic-block">
                      <div className="launchhire-dynamic-block-title">Crew Change</div>

                      <FormField label="Crew Movement">
                        <div className="launchhire-movement-toggle">
                          {LAUNCH_HIRE_CREW_MOVEMENT_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`launchhire-movement-option ${
                                crewMovementType === option.value ? "active" : ""
                              }`}
                              onClick={() => setValue("launchHireCrewMovementType", option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </FormField>

                      <FormField label="Crew List (Excel)">
                        <div className="launchhire-upload-row">
                          <input
                            ref={crewFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="launchhire-hidden-file-input"
                            onChange={handleCrewFileChange}
                          />
                          <button
                            type="button"
                            className="launchhire-upload-btn"
                            onClick={() => crewFileInputRef.current?.click()}
                          >
                            Upload Crew List
                          </button>
                          {formValues.launchHireCrewExcelFile && (
                            <span className="launchhire-file-name">
                              {formValues.launchHireCrewExcelFile}
                            </span>
                          )}
                        </div>
                      </FormField>

                      {crewPreviewRows.length > 0 && (
                        <div className="launchhire-preview-table-wrapper">
                          <table className="launchhire-preview-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Rank</th>
                                <th>Nationality</th>
                                <th>Passport No.</th>
                                <th>Seaman Book No.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {crewPreviewRows.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.name || "—"}</td>
                                  <td>{row.rank || "—"}</td>
                                  <td>{row.nationality || "—"}</td>
                                  <td>{row.passportNo || "—"}</td>
                                  <td>{row.seamanBookNo || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {showPackingUpload && (
                    <div className="launchhire-dynamic-block">
                      <div className="launchhire-dynamic-block-title">Packing List</div>

                      <FormField label="Packing List (Excel)">
                        <div className="launchhire-upload-row">
                          <input
                            ref={packingFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="launchhire-hidden-file-input"
                            onChange={handlePackingFileChange}
                          />
                          <button
                            type="button"
                            className="launchhire-upload-btn"
                            onClick={() => packingFileInputRef.current?.click()}
                          >
                            Upload Packing List
                          </button>
                          {formValues.launchHirePackingExcelFile && (
                            <span className="launchhire-file-name">
                              {formValues.launchHirePackingExcelFile}
                            </span>
                          )}
                        </div>
                      </FormField>

                      <div className="launchhire-preview-placeholder">
                        Packing list preview will appear here once parsing is available.
                      </div>
                    </div>
                  )}

                  {showImmigration && (
                    <div className="launchhire-dynamic-block">
                      <div className="launchhire-dynamic-block-title">Immigration Clearance</div>

                      <div className="launchhire-batch-grid">
                        {immigrationBatches.map((batchValue, idx) => (
                          <FormField key={idx} label={`No. of Crew In Batch ${idx + 1}`}>
                            <FormInput
                              type="number"
                              value={batchValue}
                              onChange={handleBatchChange(idx)}
                              placeholder="0"
                            />
                          </FormField>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="launchhire-add-batch-btn"
                        onClick={handleAddBatch}
                      >
                        + Add Batches
                      </button>
                    </div>
                  )}

                  <div className="form-save-button-wrapper cgpass-save-footer">
                    <button
                      type="button"
                      className="form-save-button"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

LaunchHireContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  card: PropTypes.object,
  onLaunchHireSaved: PropTypes.func,
};

export default LaunchHireContent;

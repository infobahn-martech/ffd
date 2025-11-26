import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../assets/images/cv.png";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";
import "../../../design/scss/operations.scss";

// Constants
const MAIN_TABS = {
  CREW_MANAGEMENT: "crewManagement",
  MATERIAL_MANAGEMENT: "materialManagement",
};

const CREW_MANAGEMENT_SUBTABS = {
  CREW: "crew",
  TRANSPORT: "transport",
  CG_PASS: "cgPass",
  ZAWIL_PASS: "zawilPass",
  HOTEL: "hotel",
  LAUNCH_HIRE: "launchHire",
  MEDICAL_SERVICE: "medicalService",
};

const MATERIAL_MANAGEMENT_SUBTABS = {
  WASTE_DISPOSAL: "wasteDisposal",
};

// Sub-components
const HusbandryTabs = ({ activeMainTab, activeSubTab, onMainTabChange, onSubTabChange }) => {
  const mainTabs = [
    { id: MAIN_TABS.CREW_MANAGEMENT, label: "Crew Management" },
    { id: MAIN_TABS.MATERIAL_MANAGEMENT, label: "Material Management" },
  ];

  let subTabs = [];
  if (activeMainTab === MAIN_TABS.CREW_MANAGEMENT) {
    subTabs = [
      { id: CREW_MANAGEMENT_SUBTABS.CREW, label: "Crew" },
      { id: CREW_MANAGEMENT_SUBTABS.TRANSPORT, label: "Transport" },
      { id: CREW_MANAGEMENT_SUBTABS.CG_PASS, label: "CG Pass" },
      { id: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS, label: "Zawil Pass" },
      { id: CREW_MANAGEMENT_SUBTABS.HOTEL, label: "Hotel" },
      { id: CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE, label: "Launch Hire" },
      { id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE, label: "Medical service" },
    ];
  } else if (activeMainTab === MAIN_TABS.MATERIAL_MANAGEMENT) {
    subTabs = [
      { id: MATERIAL_MANAGEMENT_SUBTABS.WASTE_DISPOSAL, label: "Waste Disposal" },
    ];
  }

  return (
    <div className="operation-left">
      {mainTabs.map((tab) => (
        <button
          key={tab.id}
          className={`op-tab ${activeMainTab === tab.id ? "active" : ""}`}
          onClick={() => onMainTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
      {subTabs.length > 0 && (
        <>
          <div style={{ height: "8px" }} /> {/* Spacer */}
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              className={`op-tab ${activeSubTab === tab.id ? "active" : ""}`}
              onClick={() => onSubTabChange(tab.id)}
              type="button"
              style={{ paddingLeft: "24px", fontSize: "12px" }}
            >
              {tab.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

HusbandryTabs.propTypes = {
  activeMainTab: PropTypes.string.isRequired,
  activeSubTab: PropTypes.string.isRequired,
  onMainTabChange: PropTypes.func.isRequired,
  onSubTabChange: PropTypes.func.isRequired,
};

const FormSection = ({ icon, title, children }) => {
  return (
    <div className="cf-section">
      {title && (
        <div className="cf-section-header">
          <span className="cf-section-icon">
            <img src={icon} alt={title} />
          </span>
          <span className="cf-section-title">{title}</span>
        </div>
      )}
      <div className="cf-section-body">{children}</div>
    </div>
  );
};

FormSection.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const FormField = ({ label, children, className = "" }) => {
  return (
    <div className={`cf-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

const FormSelect = ({ value, onChange, options = [], placeholder, className = "" }) => {
  return (
    <div className={`cf-select ${className}`}>
      <select value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

FormSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3 }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

FormTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
};

// Crew Management Content Components
const CrewContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Crew Information</h3>
            <div className="cf-grid two">
              <FormField label="Crew Name">
                <FormInput
                  type="text"
                  placeholder="Enter crew name..."
                  value={formValues.crewName || ""}
                  onChange={handleChange("crewName")}
                />
              </FormField>

              <FormField label="Crew Position">
                <FormSelect
                  value={formValues.crewPosition || ""}
                  onChange={handleChange("crewPosition")}
                  options={[]}
                  placeholder="Select position..."
                />
              </FormField>

              <FormField label="Nationality">
                <FormInput
                  type="text"
                  placeholder="Enter nationality..."
                  value={formValues.crewNationality || ""}
                  onChange={handleChange("crewNationality")}
                />
              </FormField>

              <FormField label="Passport Number">
                <FormInput
                  type="text"
                  placeholder="Enter passport number..."
                  value={formValues.crewPassportNumber || ""}
                  onChange={handleChange("crewPassportNumber")}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

CrewContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

const TransportContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Transport Information</h3>
            <div className="cf-grid two">
              <FormField label="Transport Type">
                <FormSelect
                  value={formValues.transportType || ""}
                  onChange={handleChange("transportType")}
                  options={[]}
                  placeholder="Select transport type..."
                />
              </FormField>

              <FormField label="Vehicle Number">
                <FormInput
                  type="text"
                  placeholder="Enter vehicle number..."
                  value={formValues.vehicleNumber || ""}
                  onChange={handleChange("vehicleNumber")}
                />
              </FormField>

              <FormField label="Driver Name">
                <FormInput
                  type="text"
                  placeholder="Enter driver name..."
                  value={formValues.driverName || ""}
                  onChange={handleChange("driverName")}
                />
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.driverContact || ""}
                  onChange={handleChange("driverContact")}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

TransportContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

const CGPassContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">CG Pass Information</h3>
            <div className="cf-grid two">
              <FormField label="CG Pass Number">
                <FormInput
                  type="text"
                  placeholder="Enter CG pass number..."
                  value={formValues.cgPassNumber || ""}
                  onChange={handleChange("cgPassNumber")}
                />
              </FormField>

              <FormField label="Issued Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.cgPassIssuedDate || ""}
                    onChange={handleChange("cgPassIssuedDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Expiry Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.cgPassExpiryDate || ""}
                    onChange={handleChange("cgPassExpiryDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Status">
                <FormSelect
                  value={formValues.cgPassStatus || ""}
                  onChange={handleChange("cgPassStatus")}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Expired", label: "Expired" },
                    { value: "Pending", label: "Pending" },
                  ]}
                  placeholder="Select status..."
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

CGPassContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

const ZawilPassContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Zawil Pass Information</h3>
            <div className="cf-grid two">
              <FormField label="Zawil Pass Number">
                <FormInput
                  type="text"
                  placeholder="Enter Zawil pass number..."
                  value={formValues.zawilPassNumber || ""}
                  onChange={handleChange("zawilPassNumber")}
                />
              </FormField>

              <FormField label="Issued Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.zawilPassIssuedDate || ""}
                    onChange={handleChange("zawilPassIssuedDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Expiry Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.zawilPassExpiryDate || ""}
                    onChange={handleChange("zawilPassExpiryDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Status">
                <FormSelect
                  value={formValues.zawilPassStatus || ""}
                  onChange={handleChange("zawilPassStatus")}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Expired", label: "Expired" },
                    { value: "Pending", label: "Pending" },
                  ]}
                  placeholder="Select status..."
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

ZawilPassContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

const HotelContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Hotel Information</h3>
            <div className="cf-grid two">
              <FormField label="Hotel Name">
                <FormInput
                  type="text"
                  placeholder="Enter hotel name..."
                  value={formValues.hotelName || ""}
                  onChange={handleChange("hotelName")}
                />
              </FormField>

              <FormField label="Check-in Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.hotelCheckInDate || ""}
                    onChange={handleChange("hotelCheckInDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Check-out Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.hotelCheckOutDate || ""}
                    onChange={handleChange("hotelCheckOutDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Number of Rooms">
                <FormInput
                  type="number"
                  placeholder="Enter number of rooms..."
                  value={formValues.hotelRooms || ""}
                  onChange={handleChange("hotelRooms")}
                />
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.hotelContact || ""}
                  onChange={handleChange("hotelContact")}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

HotelContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

const LaunchHireContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Launch Hire Information</h3>
            <div className="cf-grid two">
              <FormField label="Launch Name">
                <FormInput
                  type="text"
                  placeholder="Enter launch name..."
                  value={formValues.launchName || ""}
                  onChange={handleChange("launchName")}
                />
              </FormField>

              <FormField label="Hire Start Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireStartDate || ""}
                    onChange={handleChange("launchHireStartDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireStartTime || ""}
                    onChange={handleChange("launchHireStartTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Hire End Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireEndDate || ""}
                    onChange={handleChange("launchHireEndDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireEndTime || ""}
                    onChange={handleChange("launchHireEndTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.launchContact || ""}
                  onChange={handleChange("launchContact")}
                />
              </FormField>
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
};

const MedicalServiceContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Medical Service Information</h3>
            <div className="cf-grid two">
              <FormField label="Service Provider">
                <FormInput
                  type="text"
                  placeholder="Enter service provider..."
                  value={formValues.medicalServiceProvider || ""}
                  onChange={handleChange("medicalServiceProvider")}
                />
              </FormField>

              <FormField label="Service Type">
                <FormSelect
                  value={formValues.medicalServiceType || ""}
                  onChange={handleChange("medicalServiceType")}
                  options={[
                    { value: "Emergency", label: "Emergency" },
                    { value: "Routine Checkup", label: "Routine Checkup" },
                    { value: "Vaccination", label: "Vaccination" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select service type..."
                />
              </FormField>

              <FormField label="Service Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.medicalServiceDate || ""}
                    onChange={handleChange("medicalServiceDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.medicalContact || ""}
                  onChange={handleChange("medicalContact")}
                />
              </FormField>

              <FormField label="Remarks" className="cf-field-full">
                <FormTextarea
                  value={formValues.medicalRemarks || ""}
                  onChange={handleChange("medicalRemarks")}
                  placeholder="Enter remarks..."
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

MedicalServiceContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Material Management Content Components
const WasteDisposalContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Waste Disposal Information</h3>
            <div className="cf-grid two">
              <FormField label="Waste Type">
                <FormSelect
                  value={formValues.wasteType || ""}
                  onChange={handleChange("wasteType")}
                  options={[
                    { value: "Hazardous", label: "Hazardous" },
                    { value: "Non-Hazardous", label: "Non-Hazardous" },
                    { value: "Recyclable", label: "Recyclable" },
                    { value: "Organic", label: "Organic" },
                  ]}
                  placeholder="Select waste type..."
                />
              </FormField>

              <FormField label="Disposal Company">
                <FormInput
                  type="text"
                  placeholder="Enter disposal company..."
                  value={formValues.wasteDisposalCompany || ""}
                  onChange={handleChange("wasteDisposalCompany")}
                />
              </FormField>

              <FormField label="Disposal Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.wasteDisposalDate || ""}
                    onChange={handleChange("wasteDisposalDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Quantity">
                <FormInput
                  type="text"
                  placeholder="Enter quantity..."
                  value={formValues.wasteQuantity || ""}
                  onChange={handleChange("wasteQuantity")}
                />
              </FormField>

              <FormField label="Unit">
                <FormSelect
                  value={formValues.wasteUnit || ""}
                  onChange={handleChange("wasteUnit")}
                  options={[
                    { value: "kg", label: "kg" },
                    { value: "tons", label: "tons" },
                    { value: "liters", label: "liters" },
                    { value: "cubic meters", label: "cubic meters" },
                  ]}
                  placeholder="Select unit..."
                />
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.wasteContact || ""}
                  onChange={handleChange("wasteContact")}
                />
              </FormField>

              <FormField label="Remarks" className="cf-field-full">
                <FormTextarea
                  value={formValues.wasteRemarks || ""}
                  onChange={handleChange("wasteRemarks")}
                  placeholder="Enter remarks..."
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

WasteDisposalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Main Husbandry Component
function Husbandry({ card, formValues, handleChange }) {
  const [activeMainTab, setActiveMainTab] = useState(MAIN_TABS.CREW_MANAGEMENT);
  const [activeSubTab, setActiveSubTab] = useState(
    CREW_MANAGEMENT_SUBTABS.CREW
  );
  const cardColor = card?.color || "#2A00FF";

  const handleMainTabChange = useCallback((tab) => {
    setActiveMainTab(tab);
    // Reset to first sub-tab when main tab changes
    if (tab === MAIN_TABS.CREW_MANAGEMENT) {
      setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    } else if (tab === MAIN_TABS.MATERIAL_MANAGEMENT) {
      setActiveSubTab(MATERIAL_MANAGEMENT_SUBTABS.WASTE_DISPOSAL);
    }
  }, []);

  const handleSubTabChange = useCallback((tab) => {
    setActiveSubTab(tab);
  }, []);

  const renderCrewManagementContent = () => {
    switch (activeSubTab) {
      case CREW_MANAGEMENT_SUBTABS.CREW:
        return (
          <CrewContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.TRANSPORT:
        return (
          <TransportContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.CG_PASS:
        return (
          <CGPassContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS:
        return (
          <ZawilPassContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.HOTEL:
        return (
          <HotelContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE:
        return (
          <LaunchHireContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE:
        return (
          <MedicalServiceContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      default:
        return (
          <CrewContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
    }
  };

  const renderMaterialManagementContent = () => {
    switch (activeSubTab) {
      case MATERIAL_MANAGEMENT_SUBTABS.WASTE_DISPOSAL:
        return (
          <WasteDisposalContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      default:
        return (
          <WasteDisposalContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
    }
  };

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <HusbandryTabs
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
          onMainTabChange={handleMainTabChange}
          onSubTabChange={handleSubTabChange}
        />
        <div className="operation-right">
          {activeMainTab === MAIN_TABS.CREW_MANAGEMENT &&
            renderCrewManagementContent()}
          {activeMainTab === MAIN_TABS.MATERIAL_MANAGEMENT &&
            renderMaterialManagementContent()}
        </div>
      </div>
    </div>
  );
}

Husbandry.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default Husbandry;

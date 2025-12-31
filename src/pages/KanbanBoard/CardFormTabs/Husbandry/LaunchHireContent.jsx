import { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormTextarea, ReactQuillEditor } from "./Husbandry.components";

const LaunchHireContent = ({ formValues, handleChange, cardColor }) => {

  // Generate crew options from crewList
  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("launchHireSelectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.launchHireSelectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  // Custom styles for react-select multi-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '2px 4px',
      '&:hover': {
        border: 'none',
        boxShadow: 'none',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      minHeight: '38px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    }),
    multiValue: (base, state) => ({
      ...base,
      backgroundColor: "#00368c",
      borderRadius: '6px',
      padding: '2px 4px',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      minHeight: '28px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 6px',
      paddingRight: '4px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#ffffff',
      borderRadius: '4px',
      padding: '2px 4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
      fontSize: '13px',
      marginLeft: '4px',
    }),
    input: (base) => ({
      ...base,
      color: '#1a1a1a',
      fontSize: '13px',
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: '8px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#666',
      padding: '4px',
      '&:hover': {
        color: "#00368c",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#999',
      padding: '4px',
      '&:hover': {
        color: '#ff0000',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e2ea',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#00368c"
        : state.isFocused
          ? 'rgba(0, 54, 140, 0.1)'
          : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#1a1a1a',
      fontSize: '13px',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 0',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: "#00368c",
        color: '#ffffff',
      },
    }),
  };


  // Handle save
  const handleSave = () => {
    console.log("Saving Launch Hire data:", {
      launchHireSelectedCrew: formValues.launchHireSelectedCrew,
      launchHireBoardingAgentName: formValues.launchHireBoardingAgentName,
      launchHireWeather: formValues.launchHireWeather,
      launchHireBoatLeftBaseDate: formValues.launchHireBoatLeftBaseDate,
      launchHireBoatLeftBaseTime: formValues.launchHireBoatLeftBaseTime,
      launchHireBoatAlongsideShipDate: formValues.launchHireBoatAlongsideShipDate,
      launchHireBoatAlongsideShipTime: formValues.launchHireBoatAlongsideShipTime,
      launchHireBoatCastOffShipDate: formValues.launchHireBoatCastOffShipDate,
      launchHireBoatCastOffShipTime: formValues.launchHireBoatCastOffShipTime,
      launchHireBoatBackToBaseDate: formValues.launchHireBoatBackToBaseDate,
      launchHireBoatBackToBaseTime: formValues.launchHireBoatBackToBaseTime,
      launchHireServiceOptions: formValues.launchHireServiceOptions,
      launchHireServiceOptionsOthersText: formValues.launchHireServiceOptionsOthersText,
      launchHireDescription: formValues.launchHireDescription,
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form launchhire-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Select Crew">
                <div className="cf-select react-select-container crew-multi-select">
                  <Select
                    isMulti
                    value={selectedCrewValues}
                    onChange={handleCrewChange}
                    options={crewOptions}
                    placeholder={selectedCrewValues.length > 0 ? `${selectedCrewValues.length} crew selected` : "Select crew members..."}
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                </div>
              </FormField>

              <FormField label="Boarding agent name">
                <FormInput
                  type="text"
                  value={formValues.launchHireBoardingAgentName || ""}
                  onChange={handleChange("launchHireBoardingAgentName")}
                  placeholder="Enter boarding agent name..."
                />
              </FormField>

              <FormField label="Weather">
                <FormTextarea
                  value={formValues.launchHireWeather || ""}
                  onChange={handleChange("launchHireWeather")}
                  placeholder="Enter weather information..."
                  rows={3}
                />
              </FormField>

              <FormField label="BOAT LEFT THE BASE">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireBoatLeftBaseDate || ""}
                    onChange={handleChange("launchHireBoatLeftBaseDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireBoatLeftBaseTime || ""}
                    onChange={handleChange("launchHireBoatLeftBaseTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="BOAT ALONG SIDE SHIP">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireBoatAlongsideShipDate || ""}
                    onChange={handleChange("launchHireBoatAlongsideShipDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireBoatAlongsideShipTime || ""}
                    onChange={handleChange("launchHireBoatAlongsideShipTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="BOAT CAST - OFF SHIP">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireBoatCastOffShipDate || ""}
                    onChange={handleChange("launchHireBoatCastOffShipDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireBoatCastOffShipTime || ""}
                    onChange={handleChange("launchHireBoatCastOffShipTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="BOAT BACK TO BASE">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.launchHireBoatBackToBaseDate || ""}
                    onChange={handleChange("launchHireBoatBackToBaseDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.launchHireBoatBackToBaseTime || ""}
                    onChange={handleChange("launchHireBoatBackToBaseTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Service Options" className="cf-field-full">
                <div className="checkbox-group">
                  {[
                    "FREIGHTER ANCHORAGE",
                    "SING ON/SIGN OFF/MEDIC/PCR TECH/IMMIGRATION CREW",
                    "INNER ANCHORAGE",
                    "GARBAGE COLLECTION/JUMBO BAGS",
                    "MATERIAL/PALLETS",
                    "SEA ISLAND",
                    "PROVISSON/PALLETS",
                    "JUAYMAH",
                    "OTHERS"
                  ].map((option) => (
                    <div key={option} className="checkbox-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formValues.launchHireServiceOptions?.includes(option) || false}
                          onChange={(e) => {
                            const currentOptions = formValues.launchHireServiceOptions || [];
                            const newOptions = e.target.checked
                              ? [...currentOptions, option]
                              : currentOptions.filter(opt => opt !== option);
                            const syntheticEvent = { target: { value: newOptions } };
                            handleChange("launchHireServiceOptions")(syntheticEvent);

                            // Clear others text if OTHERS is unchecked
                            if (option === "OTHERS" && !e.target.checked) {
                              const clearEvent = { target: { value: "" } };
                              handleChange("launchHireServiceOptionsOthersText")(clearEvent);
                            }
                          }}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: cardColor || "#00368c",
                            marginRight: "8px",
                          }}
                        />
                        <span>{option === "OTHERS" ? "OTHERS:" : option}</span>
                      </label>
                      {option === "OTHERS" && formValues.launchHireServiceOptions?.includes("OTHERS") && (
                        <div style={{ marginLeft: "26px", marginTop: "8px" }}>
                          <FormInput
                            type="text"
                            value={formValues.launchHireServiceOptionsOthersText || ""}
                            onChange={handleChange("launchHireServiceOptionsOthersText")}
                            placeholder="Enter other service option..."
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </FormField>

              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="general-info-right">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.launchHireDescription || ""}
                    onChange={handleChange("launchHireDescription")}
                    placeholder="Enter remarks..."
                    name="launchHireDescription"
                  />
                </FormField>
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
};

export default LaunchHireContent;


import { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
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
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px"
                }}>
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
                  ].map((option) => {
                    const isSelected = formValues.launchHireServiceOptions?.includes(option) || false;
                    return (
                      <div
                        key={option}
                        onClick={() => {
                          const currentOptions = formValues.launchHireServiceOptions || [];
                          const newOptions = isSelected
                            ? currentOptions.filter(opt => opt !== option)
                            : [...currentOptions, option];
                          const syntheticEvent = { target: { value: newOptions } };
                          handleChange("launchHireServiceOptions")(syntheticEvent);

                          // Clear others text if OTHERS is unchecked
                          if (option === "OTHERS" && isSelected) {
                            const clearEvent = { target: { value: "" } };
                            handleChange("launchHireServiceOptionsOthersText")(clearEvent);
                          }
                        }}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          border: isSelected
                            ? `2px solid ${cardColor || "#00368c"}`
                            : "2px solid #e2e2ea",
                          backgroundColor: isSelected
                            ? `${cardColor || "#00368c"}15`
                            : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          minHeight: "60px",
                          position: "relative",
                          boxShadow: isSelected
                            ? `0 2px 8px ${cardColor || "#00368c"}40`
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = cardColor || "#00368c";
                            e.currentTarget.style.backgroundColor = "#f8f9ff";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#e2e2ea";
                            e.currentTarget.style.backgroundColor = "#ffffff";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                      >
                        <span style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? "600" : "500",
                          color: isSelected
                            ? (cardColor || "#00368c")
                            : "#1a1a1a",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                        }}>
                          {option === "OTHERS" ? "OTHERS" : option}
                        </span>
                        {isSelected && (
                          <div style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: cardColor || "#00368c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formValues.launchHireServiceOptions?.includes("OTHERS") && (
                  <div style={{ marginTop: "8px" }}>
                    <FormInput
                      type="text"
                      value={formValues.launchHireServiceOptionsOthersText || ""}
                      onChange={handleChange("launchHireServiceOptionsOthersText")}
                      placeholder="Enter other service option..."
                    />
                  </div>
                )}
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


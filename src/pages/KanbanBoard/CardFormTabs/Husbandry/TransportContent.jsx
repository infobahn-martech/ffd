import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect, ReactQuillEditor } from "./Husbandry.components";

const TransportContent = ({ formValues, handleChange, cardColor }) => {
  // Generate crew options from crewList
  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  // Driver name options
  const driverOptions = [
    { value: "John Smith", label: "John Smith" },
    { value: "Michael Johnson", label: "Michael Johnson" },
    { value: "David Williams", label: "David Williams" },
    { value: "Robert Brown", label: "Robert Brown" },
    { value: "James Davis", label: "James Davis" },
    { value: "William Miller", label: "William Miller" },
    { value: "Richard Wilson", label: "Richard Wilson" },
    { value: "Joseph Moore", label: "Joseph Moore" },
  ];

  // Type of car options
  const carTypeOptions = [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Van", label: "Van" },
    { value: "Bus", label: "Bus" },
    { value: "Truck", label: "Truck" },
    { value: "Taxi", label: "Taxi" },
  ];

  // Invoice Branch options
  const invoiceBranchOptions = [
    { value: "Branch 1", label: "Branch 1" },
    { value: "Branch 2", label: "Branch 2" },
    { value: "Branch 3", label: "Branch 3" },
    { value: "Main Office", label: "Main Office" },
  ];

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("selectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.selectedCrew?.map((crewId) =>
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
    // You can add validation here
    console.log("Saving transport data:", {
      selectedCrew: formValues.selectedCrew,
      driverName: formValues.driverName,
      dateTime: formValues.transportDateTime,
      time: formValues.transportTime,
      from: formValues.transportFrom,
      to: formValues.transportTo,
      carType: formValues.carType,
      invoiceBranch: formValues.invoiceBranch,
    });
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form transport-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <div className="card-description-wrapper">
                <FormField label="Description">
                  <ReactQuillEditor
                    value={formValues?.transportDescription || ""}
                    onChange={handleChange("transportDescription")}
                    placeholder="Enter transport description..."
                    name="transportDescription"
                  />
                </FormField>
              </div>
            </div>

            <div className="general-info-right">
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

              <FormField label="Driver Name">
                <FormSelect
                  value={formValues.driverName || ""}
                  onChange={handleChange("driverName")}
                  options={driverOptions}
                  placeholder="Select driver name..."
                />
              </FormField>

              <FormField label="Pickup Date Time">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.transportDateTime || ""}
                    onChange={handleChange("transportDateTime")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.transportTime || ""}
                    onChange={handleChange("transportTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="From">
                <FormInput
                  type="text"
                  placeholder="Enter from location..."
                  value={formValues.transportFrom || ""}
                  onChange={handleChange("transportFrom")}
                />
              </FormField>

              <FormField label="To">
                <FormInput
                  type="text"
                  placeholder="Enter to location..."
                  value={formValues.transportTo || ""}
                  onChange={handleChange("transportTo")}
                />
              </FormField>

              <FormField label="Type of Car">
                <FormSelect
                  value={formValues.carType || ""}
                  onChange={handleChange("carType")}
                  options={carTypeOptions}
                  placeholder="Select type of car..."
                />
              </FormField>

              <FormField label="Invoice Branch">
                <FormSelect
                  value={formValues.invoiceBranch || ""}
                  onChange={handleChange("invoiceBranch")}
                  options={invoiceBranchOptions}
                  placeholder="Select invoice branch..."
                />
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

export default TransportContent;


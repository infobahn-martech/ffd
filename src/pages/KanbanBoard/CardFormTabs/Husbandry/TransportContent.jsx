import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect } from "./Husbandry.components";

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
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Transport Information</h3>
            <div className="cf-grid two">
              <FormField label="Select Crew">
                <div className="cf-select react-select-container">
                  <Select
                    isMulti
                    value={selectedCrewValues}
                    onChange={handleCrewChange}
                    options={crewOptions}
                    placeholder="Select crew..."
                    classNamePrefix="react-select"
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

              <FormField label="Date Time">
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
            </div>
          </div>
          <div className="form-group" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="checklist-btn-primary"
              onClick={handleSave}
              style={{ "--card-color": cardColor }}
            >
              Save
            </button>
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


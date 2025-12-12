import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect, FormTextarea } from "./Husbandry.components";

const WasteDisposalContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      In-Progress
      {/* <FormSection icon={GroupSettingsIcon} title="">
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
      </FormSection> */}
    </div>
  );
};

WasteDisposalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default WasteDisposalContent;


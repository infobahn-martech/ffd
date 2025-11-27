import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect, FormTextarea } from "./Husbandry.components";

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

export default MedicalServiceContent;


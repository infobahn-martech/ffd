import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect } from "./Husbandry.components";

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

export default CGPassContent;


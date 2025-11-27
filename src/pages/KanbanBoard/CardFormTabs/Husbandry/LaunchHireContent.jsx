import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput } from "./Husbandry.components";

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

export default LaunchHireContent;


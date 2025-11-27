import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect } from "./Husbandry.components";

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

export default ZawilPassContent;


import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, FormSelect } from "./Husbandry.components";

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

export default TransportContent;


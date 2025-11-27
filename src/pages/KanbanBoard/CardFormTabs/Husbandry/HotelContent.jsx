import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput } from "./Husbandry.components";

const HotelContent = ({ formValues, handleChange, cardColor }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Hotel Information</h3>
            <div className="cf-grid two">
              <FormField label="Hotel Name">
                <FormInput
                  type="text"
                  placeholder="Enter hotel name..."
                  value={formValues.hotelName || ""}
                  onChange={handleChange("hotelName")}
                />
              </FormField>

              <FormField label="Check-in Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.hotelCheckInDate || ""}
                    onChange={handleChange("hotelCheckInDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Check-out Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.hotelCheckOutDate || ""}
                    onChange={handleChange("hotelCheckOutDate")}
                    placeholder="Select date"
                  />
                </div>
              </FormField>

              <FormField label="Number of Rooms">
                <FormInput
                  type="number"
                  placeholder="Enter number of rooms..."
                  value={formValues.hotelRooms || ""}
                  onChange={handleChange("hotelRooms")}
                />
              </FormField>

              <FormField label="Contact Number">
                <FormInput
                  type="tel"
                  placeholder="Enter contact number..."
                  value={formValues.hotelContact || ""}
                  onChange={handleChange("hotelContact")}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

HotelContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default HotelContent;


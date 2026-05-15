import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import DateTimePickerField from "../../../components/DateTimePickerField";
import hotelService from "../../../../../../services/hotelService";

const unwrapApiList = (axiosData) => {
  const payload = axiosData?.data ?? axiosData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const HotelContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingHotels(true);
        const { data } = await hotelService.getHotels();
        const list = unwrapApiList(data);
        if (!cancelled) setHotels(list);
      } catch {
        if (!cancelled) setHotels([]);
      } finally {
        if (!cancelled) setLoadingHotels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hotelOptions = hotels.map((h) => ({
    value: String(h.hotel_id ?? h._id ?? ""),
    label: h.hotel_name ?? "",
  }));

  const handleHotelChange = (e) => {
    handleChange("hotelId")(e);
    const id = e.target.value;
    const row = hotels.find((h) => String(h.hotel_id ?? h._id) === id);
    handleChange("hotelName")({ target: { value: row?.hotel_name ?? "" } });
  };

  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("hotelSelectedCrew")(syntheticEvent);
  };

  const selectedCrewValues = formValues.hotelSelectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor, { transportCompact: true });

  const fileToAttachment = (file) => ({
    name: file.name,
    file,
    size: file.size,
    type: file.type,
  });

  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const current = formValues.hotelDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("hotelDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = formValues.hotelDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("hotelDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = formValues.hotelDocuments || [];
    handleChange("hotelDocuments")({ target: { value: current.filter((_, i) => i !== index) } });
  };

  const handleSave = () => {
    console.log("Saving Hotel data:", {
      hotelSelectedCrew: formValues.hotelSelectedCrew,
      hotelId: formValues.hotelId,
      hotelName: formValues.hotelName,
      hotelCheckInDate: formValues.hotelCheckInDate,
      hotelCheckInTime: formValues.hotelCheckInTime,
      hotelCheckOutDate: formValues.hotelCheckOutDate,
      hotelCheckOutTime: formValues.hotelCheckOutTime,
      hotelDocuments: formValues.hotelDocuments,
      hotelDescription: formValues.hotelDescription,
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form hotel-form">
          <div className="transport-request-layout">
            <div className="transport-request-left transport-panel-card">
              <div className="transport-panel-header">
                <h3 className="transport-panel-header__title">Request Details</h3>
              </div>

              <div className="transport-request-left__scroll transport-panel-scroll">
                <FormField label="Select Crew">
                  <div className="cf-select react-select-container crew-multi-select">
                    <Select
                      isMulti
                      value={selectedCrewValues}
                      onChange={handleCrewChange}
                      options={crewOptions}
                      placeholder="Select crew members..."
                      classNamePrefix="react-select"
                      styles={customSelectStyles}
                      formatOptionLabel={formatCrewOptionLabel}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                      menuShouldBlockScroll={true}
                      isClearable
                      isSearchable
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                    />
                  </div>
                </FormField>

                <FormField label="Hotel Name">
                  <FormSelect
                    value={formValues.hotelId || ""}
                    onChange={handleHotelChange}
                    options={hotelOptions}
                    placeholder={loadingHotels ? "Loading hotels..." : "Select hotel name..."}
                    disabled={loadingHotels}
                  />
                </FormField>

                <FormField label="Check-in Date">
                  <div className="transport-date-time-field">
                    <DateTimePickerField
                      dateValue={formValues.hotelCheckInDate || ""}
                      timeValue={formValues.hotelCheckInTime || ""}
                      onDateChange={handleChange("hotelCheckInDate")}
                      onTimeChange={handleChange("hotelCheckInTime")}
                      dateFieldName="hotelCheckInDate"
                      timeFieldName="hotelCheckInTime"
                      placeholder="Select date and time"
                    />
                  </div>
                </FormField>

                <FormField label="Check-out Date">
                  <div className="transport-date-time-field">
                    <DateTimePickerField
                      dateValue={formValues.hotelCheckOutDate || ""}
                      timeValue={formValues.hotelCheckOutTime || ""}
                      onDateChange={handleChange("hotelCheckOutDate")}
                      onTimeChange={handleChange("hotelCheckOutTime")}
                      dateFieldName="hotelCheckOutDate"
                      timeFieldName="hotelCheckOutTime"
                      placeholder="Select date and time"
                    />
                  </div>
                </FormField>

                <FormField label="Documents" className="cf-field-full">
                  <div className="transport-upload-box">
                    <AttachmentsList
                      attachments={formValues.hotelDocuments || []}
                      onAdd={() => {}}
                      onRemove={handleDocumentsRemoveAttachment}
                      cardColor={cardColor}
                      isDragging={isDragging}
                      onDragEnter={handleDocumentsDragEnter}
                      onDragLeave={handleDocumentsDragLeave}
                      onDragOver={handleDocumentsDragOver}
                      onDrop={handleDocumentsDrop}
                      fileInputRef={fileInputRef}
                      onFileInputChange={handleDocumentsFileInputChange}
                    />
                  </div>
                </FormField>
              </div>

              <div className="transport-save-footer">
                <button type="button" className="form-save-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            <div className="transport-request-right transport-panel-card">
              <div className="transport-panel-header">
                <h3 className="transport-panel-header__title">Remarks</h3>
              </div>
              <div className="transport-request-right__body transport-panel-scroll">
                <ReactQuillEditor
                  value={formValues?.hotelDescription || ""}
                  onChange={handleChange("hotelDescription")}
                  placeholder="Enter remarks..."
                  name="hotelDescription"
                  className="transport-remarks-quill"
                />
              </div>
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

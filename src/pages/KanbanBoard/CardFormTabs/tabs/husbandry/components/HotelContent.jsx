import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../components/Toaster";
import { FormSection, FormField, FormSelect, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import DateTimePickerField from "../../../components/DateTimePickerField";
import hotelService, {
  extractHotelRequestsFromEnvelope,
  flattenHotelRequestRows,
} from "../../../../../../services/hotelService";
import crewService from "../../../../../../services/crewService";
import { buildPickupDateTime } from "../../../../../../store/TransportContent";
import HusbandryServiceRequestsTable from "./HusbandryServiceRequestsTable";

const HOTEL_REQUEST_COLUMNS = [
  { key: "wo_number", header: "Wo No", accessor: (r) => r?.wo_number ?? r?.work_order_no },
  { key: "crew_name", header: "Crew Name", accessor: (r) => r?.crew_name ?? r?.crewName },
  { key: "hotel_name", header: "Hotel", accessor: (r) => r?.hotel_name ?? r?.hotelName },
  {
    key: "check_in",
    header: "Check-in",
    accessor: (r) => r?.check_in ?? r?.check_in_date ?? r?.checkin_datetime,
    type: "date",
  },
  {
    key: "check_out",
    header: "Check-out",
    accessor: (r) => r?.check_out ?? r?.check_out_date ?? r?.checkout_datetime,
    type: "date",
  },
  {
    key: "status",
    header: "Status",
    accessor: (r) => r?.status ?? r?.stay_status,
    type: "status",
  },
  { key: "document", header: "Document", type: "document" },
];

const REQUEST_EMAIL_ACCEPT_ATTR = ".msg,.eml,.pdf,.doc,.docx";
const REQUEST_EMAIL_EXT_RE = /\.(msg|eml|pdf|doc|docx)$/i;

const unwrapApiList = (axiosData) => {
  const payload = axiosData?.data ?? axiosData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const HotelContent = ({ formValues, handleChange, cardColor }) => {
  const requestEmailInputRef = useRef(null);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [crewList, setCrewList] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [isSavingHotel, setIsSavingHotel] = useState(false);
  const [hotelRequests, setHotelRequests] = useState([]);
  const [loadingHotelRequests, setLoadingHotelRequests] = useState(false);

  const callId = formValues.call_id || formValues.callId || formValues.card_call_id;

  useEffect(() => {
    if (!callId) {
      setCrewList([]);
      setLoadingCrew(false);
      return;
    }

    let cancelled = false;
    setLoadingCrew(true);

    crewService
      .getCrewByCall(callId)
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : [];
        if (!cancelled) setCrewList(list);
      })
      .catch(() => {
        if (!cancelled) setCrewList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCrew(false);
      });

    return () => {
      cancelled = true;
    };
  }, [callId]);

  const crewOptions = crewList.map((crew) => ({
    value: String(crew.crew_change_id ?? ""),
    label: crew.crew_name || `Crew ${crew.crew_id}`,
    crewId: crew.crew_id,
    crewChangeId: crew.crew_change_id,
  }));

  const fetchHotelRequests = useCallback(async () => {
    if (!callId) {
      setHotelRequests([]);
      setLoadingHotelRequests(false);
      return;
    }

    setLoadingHotelRequests(true);
    try {
      const response = await hotelService.getHotelRequests(callId);
      const list = extractHotelRequestsFromEnvelope(response);
      setHotelRequests(flattenHotelRequestRows(list));
    } catch {
      setHotelRequests([]);
    } finally {
      setLoadingHotelRequests(false);
    }
  }, [callId]);

  useEffect(() => {
    void fetchHotelRequests();
  }, [fetchHotelRequests]);

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

  const selectedCrewValues =
    formValues.hotelSelectedCrew
      ?.map((crewChangeId) =>
        crewOptions.find((opt) => String(opt.value) === String(crewChangeId))
      )
      .filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor, { transportCompact: true });

  const fileToAttachment = (file) => ({
    name: file.name,
    file,
    size: file.size,
    type: file.type,
  });

  const filterRequestEmailFiles = (files) =>
    Array.from(files || []).filter((f) => REQUEST_EMAIL_EXT_RE.test(f.name));

  const handleRequestEmailDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(true);
  };

  const handleRequestEmailDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(false);
  };

  const handleRequestEmailDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRequestEmailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(false);
    const raw = Array.from(e.dataTransfer.files || []);
    const allowed = filterRequestEmailFiles(raw);
    if (allowed.length === 0) {
      if (raw.length > 0) {
        notify(
          "Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.",
          "warning",
          "top-center"
        );
      }
      return;
    }
    handleChange("hotelRequestEmail")({
      target: { value: [fileToAttachment(allowed[0])] },
    });
  };

  const handleRequestEmailFileInputChange = (e) => {
    const raw = Array.from(e.target.files || []);
    const allowed = filterRequestEmailFiles(raw);
    if (allowed.length === 0) {
      if (raw.length > 0) {
        notify(
          "Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.",
          "warning",
          "top-center"
        );
      }
    } else {
      handleChange("hotelRequestEmail")({
        target: { value: [fileToAttachment(allowed[0])] },
      });
    }
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleRequestEmailRemoveAttachment = () => {
    handleChange("hotelRequestEmail")({ target: { value: [] } });
  };

  const handleSave = useCallback(async () => {
    if (!callId) {
      notify("Call is required to save a hotel request.", "error", "top-center");
      return;
    }

    if (!formValues.hotelId) {
      notify("Hotel is required.", "error", "top-center");
      return;
    }

    const selectedCrew = formValues.hotelSelectedCrew || [];
    if (selectedCrew.length === 0) {
      notify("Select at least one crew member.", "error", "top-center");
      return;
    }

    const checkinDatetime = buildPickupDateTime(
      formValues.hotelCheckInDate,
      formValues.hotelCheckInTime
    );
    const checkoutDatetime = buildPickupDateTime(
      formValues.hotelCheckOutDate,
      formValues.hotelCheckOutTime
    );

    if (!checkinDatetime) {
      notify("Check-in date and time are required.", "error", "top-center");
      return;
    }

    if (!checkoutDatetime) {
      notify("Check-out date and time are required.", "error", "top-center");
      return;
    }

    const payload = {
      call_id: Number(callId),
      hotel_id: Number(formValues.hotelId),
      checkin_datetime: checkinDatetime,
      checkout_datetime: checkoutDatetime,
      remarks: formValues.hotelDescription || "",
      crew: selectedCrew.map((id) => ({
        crew_change_id: Number(id),
      })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    const requestEmailFile = formValues.hotelRequestEmail?.[0]?.file;
    if (requestEmailFile) {
      formData.append("request_email", requestEmailFile);
    }

    setIsSavingHotel(true);
    try {
      const response = await hotelService.createHotelRequest(formData);
      notify(
        response?.data?.message || "Hotel request created successfully",
        "success",
        "top-center"
      );
      await fetchHotelRequests();
    } catch (error) {
      notify(
        error?.response?.data?.message || "Failed to create hotel request",
        "error",
        "top-center"
      );
    } finally {
      setIsSavingHotel(false);
    }
  }, [callId, formValues, fetchHotelRequests]);

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form hotel-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Request Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                <FormField label="Select Crew">
                  <div className="cf-select react-select-container crew-multi-select">
                    <Select
                      isMulti
                      value={selectedCrewValues}
                      onChange={handleCrewChange}
                      options={crewOptions}
                      placeholder={loadingCrew ? "Loading crew..." : "Select crew members..."}
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
                      isLoading={loadingCrew}
                      isDisabled={loadingCrew || !callId}
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

                <FormField label="Documents">
                  <div className="transport-upload-box">
                    <AttachmentsList
                      attachments={formValues.hotelRequestEmail || []}
                      onAdd={() => {}}
                      onRemove={handleRequestEmailRemoveAttachment}
                      cardColor={cardColor}
                      isDragging={isDraggingEmail}
                      onDragEnter={handleRequestEmailDragEnter}
                      onDragLeave={handleRequestEmailDragLeave}
                      onDragOver={handleRequestEmailDragOver}
                      onDrop={handleRequestEmailDrop}
                      fileInputRef={requestEmailInputRef}
                      onFileInputChange={handleRequestEmailFileInputChange}
                      accept={REQUEST_EMAIL_ACCEPT_ATTR}
                      multiple={false}
                    />
                  </div>
                </FormField>

                  <div className="cgpass-remarks">
                    <FormField label="Remarks">
                      <ReactQuillEditor
                        value={formValues?.hotelDescription || ""}
                        onChange={handleChange("hotelDescription")}
                        placeholder="Enter remarks..."
                        name="hotelDescription"
                      />
                    </FormField>
                  </div>

                  <div className="form-save-button-wrapper cgpass-save-footer">
                    <button
                      type="button"
                      className="form-save-button"
                      onClick={handleSave}
                      disabled={isSavingHotel}
                    >
                      {isSavingHotel ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <HusbandryServiceRequestsTable
                title="Hotel Requests"
                requests={hotelRequests}
                loading={loadingHotelRequests}
                columns={HOTEL_REQUEST_COLUMNS}
                emptyMessage="No hotel requests found"
                serviceType="hotel"
              />
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
import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../../components/Toaster";
import { FormSection, FormField, FormSelect, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import LocationAutocomplete from "./LocationAutocomplete";
import AttachmentsList from "../../appointment/AttachmentsList";
import DateTimePickerField from "../../../../shared/components/DateTimePickerField";
import vehicleService from "../../../../../../../services/vehicleService";
import transportCompanyService from "../../../../../../../services/transportCompanyService";
import crewService from "../../../../../../../services/crewService";
import callFileService from "../../../../../../../services/callFileService";
import transportContentService, {
  extractTransportRequestsFromEnvelope,
  flattenTransportRequestRows,
} from "../../../../../../../services/transportContentService";
import { buildPickupDateTime } from "../../../../../../../store/TransportContent";
import HusbandryServiceRequestsTable from "./HusbandryServiceRequestsTable";

const TRANSPORT_REQUEST_COLUMNS = [
  { key: "wo_number", header: "Wo No", accessor: (r) => r?.wo_number ?? r?.work_order_no },
  { key: "crew_name", header: "Crew Name", accessor: (r) => r?.crew_name ?? r?.crewName },
  {
    key: "from",
    header: "From",
    accessor: (r) => r?.from ?? r?.from_location ?? r?.pickup_location,
  },
  {
    key: "to",
    header: "To",
    accessor: (r) => r?.to ?? r?.to_location ?? r?.drop_location,
  },
  {
    key: "status",
    header: "Status",
    accessor: (r) => r?.status ?? r?.pickup_status,
    type: "status",
  },
  {
    key: "requested_date",
    header: "Requested Date",
    accessor: (r) => r?.requested_date ?? r?.pickup_datetime,
    type: "date",
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

const TransportContent = ({ formValues, handleChange, cardColor }) => {
  const requestEmailInputRef = useRef(null);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);

  // Radio button state - default to "inhouse" if not set
  const [transportType, setTransportType] = useState(formValues.transportType || "inhouse");

  // Sync state with formValues when it changes
  useEffect(() => {
    if (formValues.transportType) {
      setTransportType(formValues.transportType);
    }
  }, [formValues.transportType]);

  const callId = formValues.call_id || formValues.callId || formValues.card_call_id;

  const [crewList, setCrewList] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [callDetails, setCallDetails] = useState(null);

  useEffect(() => {
    if (!callId) {
      setCallDetails(null);
      return;
    }

    let cancelled = false;

    callFileService
      .getCallDetail(callId)
      .then(({ data }) => {
        const details = data?.data || null;
        if (!cancelled) setCallDetails(details);
      })
      .catch(() => {
        if (!cancelled) setCallDetails(null);
      });

    return () => {
      cancelled = true;
    };
  }, [callId]);

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

  const [transportVehicles, setTransportVehicles] = useState([]);
  const [inhouseDrivers, setInhouseDrivers] = useState([]);
  const [transportCompanies, setTransportCompanies] = useState([]);
  const [thirdPartyDrivers, setThirdPartyDrivers] = useState([]);

  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingInhouseDrivers, setLoadingInhouseDrivers] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingThirdPartyDrivers, setLoadingThirdPartyDrivers] = useState(false);
  const [isSavingTransport, setIsSavingTransport] = useState(false);
  const [transportRequests, setTransportRequests] = useState([]);
  const [loadingTransportRequests, setLoadingTransportRequests] = useState(false);

  const fetchTransportRequests = useCallback(async () => {
    if (!callId) {
      setTransportRequests([]);
      setLoadingTransportRequests(false);
      return;
    }

    setLoadingTransportRequests(true);
    try {
      const response = await transportContentService.getTransportRequest(callId);
      const list = extractTransportRequestsFromEnvelope(response);
      setTransportRequests(flattenTransportRequestRows(list));
    } catch {
      setTransportRequests([]);
    } finally {
      setLoadingTransportRequests(false);
    }
  }, [callId]);

  useEffect(() => {
    void fetchTransportRequests();
  }, [fetchTransportRequests]);

  // Invoice Branch options
  const invoiceBranchOptions = [
    { value: "Branch 1", label: "Branch 1" },
    { value: "Branch 2", label: "Branch 2" },
    { value: "Branch 3", label: "Branch 3" },
    { value: "Main Office", label: "Main Office" },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingVehicles(true);
        const { data } = await vehicleService.getAllTransportVehicles();
        const list = unwrapApiList(data);
        if (!cancelled) setTransportVehicles(list);
      } catch {
        if (!cancelled) setTransportVehicles([]);
      } finally {
        if (!cancelled) setLoadingVehicles(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCompanies(true);
        const { data } = await transportCompanyService.getTransportCompanyData();
        const list = unwrapApiList(data);
        if (!cancelled) setTransportCompanies(list);
      } catch {
        if (!cancelled) setTransportCompanies([]);
      } finally {
        if (!cancelled) setLoadingCompanies(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const vehicleTypeId = formValues.transportVehicleTypeId;
    if (!vehicleTypeId || transportType !== "inhouse") {
      setInhouseDrivers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingInhouseDrivers(true);
        const { data } = await vehicleService.getDriversByVehicleType(vehicleTypeId);
        const list = unwrapApiList(data);
        if (!cancelled) setInhouseDrivers(list);
      } catch {
        if (!cancelled) setInhouseDrivers([]);
      } finally {
        if (!cancelled) setLoadingInhouseDrivers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formValues.transportVehicleTypeId, transportType]);

  useEffect(() => {
    const companyId = formValues.transportCompanyId;
    if (!companyId || transportType !== "thirdparty") {
      setThirdPartyDrivers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingThirdPartyDrivers(true);
        const { data } = await transportCompanyService.getTransportCompanyById(companyId);
        const row = data?.data ?? data;
        const company = Array.isArray(row) ? row[0] : row;
        const drivers = company?.drivers;
        if (!cancelled) setThirdPartyDrivers(Array.isArray(drivers) ? drivers : []);
      } catch {
        if (!cancelled) setThirdPartyDrivers([]);
      } finally {
        if (!cancelled) setLoadingThirdPartyDrivers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formValues.transportCompanyId, transportType]);

  const vehicleOptions = transportVehicles.map((v) => ({
    value: String(v.vehicle_type_id ?? ""),
    label: v.vehicle_name || `Vehicle ${v.vehicle_type_id}`,
  }));

  const inhouseDriverOptions = inhouseDrivers.map((d) => ({
    value: String(d.driver_id ?? ""),
    label: d.driver_name ?? "",
  }));

  const companyOptions = transportCompanies.map((c) => ({
    value: String(c.transport_company_id ?? ""),
    label: c.transport_company || `Company ${c.transport_company_id}`,
  }));

  const thirdPartyDriverOptions = thirdPartyDrivers.map((d) => ({
    value: String(d.transport_driver_id ?? ""),
    label: [
      d.driver_name,
      d.vehicle_type,
      d.seater != null ? `${d.seater} seater` : null,
      d.contact_no,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const clearTransportSelections = useCallback(() => {
    handleChange("transportVehicleTypeId")({ target: { value: "" } });
    handleChange("transportDriverId")({ target: { value: "" } });
    handleChange("transportCompanyId")({ target: { value: "" } });
    handleChange("transportThirdPartyDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  }, [handleChange]);

  // Handle transport type radio button change
  const handleTransportTypeChange = (e) => {
    const value = e.target.value;
    setTransportType(value);
    const syntheticEvent = { target: { value: value } };
    handleChange("transportType")(syntheticEvent);
    clearTransportSelections();
  };

  const handleVehicleChange = (e) => {
    handleChange("transportVehicleTypeId")(e);
    handleChange("transportDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  };

  const handleInhouseDriverChange = (e) => {
    handleChange("transportDriverId")(e);
    const id = e.target.value;
    const row = inhouseDrivers.find((d) => String(d.driver_id) === id);
    handleChange("driverName")({ target: { value: row?.driver_name ?? "" } });
  };

  const handleCompanyChange = (e) => {
    handleChange("transportCompanyId")(e);
    handleChange("transportThirdPartyDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  };

  const handleThirdPartyDriverChange = (e) => {
    handleChange("transportThirdPartyDriverId")(e);
    const id = e.target.value;
    const row = thirdPartyDrivers.find((d) => String(d.transport_driver_id) === id);
    handleChange("driverName")({ target: { value: row?.driver_name ?? "" } });
  };

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("selectedCrew")(syntheticEvent);
  };

  const selectedCrewValues =
    formValues.selectedCrew
      ?.map((crewChangeId) => crewOptions.find((opt) => String(opt.value) === String(crewChangeId)))
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
    handleChange("transportRequestEmail")({
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
      handleChange("transportRequestEmail")({
        target: { value: [fileToAttachment(allowed[0])] },
      });
    }
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleRequestEmailRemoveAttachment = () => {
    handleChange("transportRequestEmail")({ target: { value: [] } });
  };

  const handleSave = useCallback(async () => {
    if (!callId) {
      notify("Call is required to save a transport request.", "error", "top-center");
      return;
    }

    if (!callDetails?.call_type_id) {
      notify("Call type id is missing. Please reload call details.", "warning", "top-center");
      return;
    }

    if (!callDetails?.vessel_id) {
      notify("Vessel id is missing. Please reload call details.", "warning", "top-center");
      return;
    }

    const pickupDateTime = buildPickupDateTime(
      formValues.transportDateTime,
      formValues.transportTime
    );

    const payload = {
      call_id: Number(callDetails?.call_id || ""),
      vessel_id: Number(callDetails?.vessel_id || ""),
      request_type: transportType === "thirdparty" ? "Third Party" : "Inhouse",
      pickup_datetime: pickupDateTime,
      from_location: formValues.transportFrom || "",
      to_location: formValues.transportTo || "",
      remarks: formValues.transportDescription || "",
      crew: (formValues.selectedCrew || []).map((id) => ({
        crew_change_id: Number(id),
      })),
    };

    if (transportType === "inhouse") {
      payload.vehicle_id = Number(formValues.transportVehicleTypeId || "");
      payload.driver_id = Number(formValues.transportDriverId || "");
      payload.invoice_branch = formValues.invoiceBranch || "";
    }

    if (transportType === "thirdparty") {
      payload.transport_company_id = Number(formValues.transportCompanyId || "");
      payload.transport_driver_id = Number(formValues.transportThirdPartyDriverId || "");
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    const requestEmailFile = formValues.transportRequestEmail?.[0]?.file;
    if (requestEmailFile) {
      formData.append("request_email", requestEmailFile);
    }

    setIsSavingTransport(true);
    try {
      const response = await transportContentService.createTransportRequest(formData);
      notify(
        response?.data?.message || "Transport request created successfully",
        "success",
        "top-center"
      );
      await fetchTransportRequests();
    } catch (error) {
      notify(
        error?.response?.data?.message || "Failed to create transport request",
        "error",
        "top-center"
      );
    } finally {
      setIsSavingTransport(false);
    }
  }, [callId, callDetails, formValues, transportType, fetchTransportRequests]);

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form transport-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Request Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                <FormField label="Request Email">
                  <div className="transport-upload-box">
                    <AttachmentsList
                      attachments={formValues.transportRequestEmail || []}
                      onAdd={() => { }}
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

                <FormField label="">
                  <div className="transport-type-radio-row">
                    <label className="transport-type-radio">
                      <input
                        type="radio"
                        name="transportType"
                        value="inhouse"
                        checked={transportType === "inhouse"}
                        onChange={handleTransportTypeChange}
                      />
                      <span>In house</span>
                    </label>
                    <label className="transport-type-radio">
                      <input
                        type="radio"
                        name="transportType"
                        value="thirdparty"
                        checked={transportType === "thirdparty"}
                        onChange={handleTransportTypeChange}
                      />
                      <span>Third party</span>
                    </label>
                  </div>
                </FormField>

                {transportType === "inhouse" && (
                  <>
                    <FormField label="Vehicle">
                      <FormSelect
                        value={formValues.transportVehicleTypeId || ""}
                        onChange={handleVehicleChange}
                        options={vehicleOptions}
                        placeholder={
                          loadingVehicles ? "Loading vehicles..." : "Select vehicle..."
                        }
                        disabled={loadingVehicles}
                      />
                    </FormField>

                    <FormField label="Driver Name">
                      <FormSelect
                        value={formValues.transportDriverId || ""}
                        onChange={handleInhouseDriverChange}
                        options={inhouseDriverOptions}
                        placeholder={
                          !formValues.transportVehicleTypeId
                            ? "Select a vehicle first..."
                            : loadingInhouseDrivers
                              ? "Loading drivers..."
                              : "Select driver name..."
                        }
                        disabled={!formValues.transportVehicleTypeId || loadingInhouseDrivers}
                      />
                    </FormField>
                  </>
                )}

                {transportType === "thirdparty" && (
                  <>
                    <FormField label="Transport Company">
                      <FormSelect
                        value={formValues.transportCompanyId || ""}
                        onChange={handleCompanyChange}
                        options={companyOptions}
                        placeholder={
                          loadingCompanies ? "Loading companies..." : "Select transport company..."
                        }
                        disabled={loadingCompanies}
                      />
                    </FormField>

                    <FormField label="Driver Name">
                      <FormSelect
                        value={formValues.transportThirdPartyDriverId || ""}
                        onChange={handleThirdPartyDriverChange}
                        options={thirdPartyDriverOptions}
                        placeholder={
                          !formValues.transportCompanyId
                            ? "Select a company first..."
                            : loadingThirdPartyDrivers
                              ? "Loading drivers..."
                              : "Select driver..."
                        }
                        disabled={!formValues.transportCompanyId || loadingThirdPartyDrivers}
                      />
                    </FormField>
                  </>
                )}

                <FormField label="Pickup Date Time">
                  <div className="transport-date-time-field">
                    <DateTimePickerField
                      dateValue={formValues.transportDateTime || ""}
                      timeValue={formValues.transportTime || ""}
                      onDateChange={handleChange("transportDateTime")}
                      onTimeChange={handleChange("transportTime")}
                      dateFieldName="transportDateTime"
                      timeFieldName="transportTime"
                      placeholder="Select date and time"
                    />
                  </div>
                </FormField>

                <FormField label="From">
                  <LocationAutocomplete
                    value={formValues.transportFrom || ""}
                    onChange={handleChange("transportFrom")}
                    placeholder="Search for a location..."
                    onLocationSelect={() => {}}
                  />
                </FormField>

                <FormField label="To">
                  <LocationAutocomplete
                    value={formValues.transportTo || ""}
                    onChange={handleChange("transportTo")}
                    placeholder="Search for a location..."
                    onLocationSelect={() => {}}
                  />
                </FormField>

                {transportType === "inhouse" && (
                  <FormField label="Invoice Branch">
                    <FormSelect
                      value={formValues.invoiceBranch || ""}
                      onChange={handleChange("invoiceBranch")}
                      options={invoiceBranchOptions}
                      placeholder="Select invoice branch..."
                    />
                  </FormField>
                )}

                  <div className="cgpass-remarks">
                    <FormField label="Remarks">
                      <ReactQuillEditor
                        value={formValues?.transportDescription || ""}
                        onChange={handleChange("transportDescription")}
                        placeholder="Enter remarks..."
                        name="transportDescription"
                      />
                    </FormField>
                  </div>

                  <div className="form-save-button-wrapper cgpass-save-footer">
                    <button
                      type="button"
                      className="form-save-button"
                      onClick={handleSave}
                      disabled={isSavingTransport}
                    >
                      {isSavingTransport ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <HusbandryServiceRequestsTable
                title="Transport Requests"
                requests={transportRequests}
                loading={loadingTransportRequests}
                columns={TRANSPORT_REQUEST_COLUMNS}
                emptyMessage="No transport requests found"
                serviceType="transport"
              />
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


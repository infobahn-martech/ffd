import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../../components/Toaster";
import { FormSection, FormField, FormSelect, ReactQuillEditor, FormGroup, FieldRow, PremiumCardHeader } from "./Husbandry.components";
import { TRANSPORT_ROUTE_LOCATION_OPTIONS } from "./Husbandry.constants";
import LocationAutocomplete from "./LocationAutocomplete";
import AttachmentsList from "../../appointment/AttachmentsList";
import DateTimePickerField from "../../../../shared/components/DateTimePickerField";
import transportCompanyService from "../../../../../../../services/transportCompanyService";
import callFileService from "../../../../../../../services/callFileService";
import transportContentService from "../../../../../../../services/transportContentService";
import { buildPickupDateTime } from "../../../../../../../store/TransportContent";
import HusbandryServiceRequestsTable from "./HusbandryServiceRequestsTable";

// Helper functions to extract and flatten transport requests from API response
const extractTransportRequestsFromEnvelope = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const flattenTransportRequestRows = (requests) => {
  if (!Array.isArray(requests)) return [];
  
  return requests.flatMap((request) => {
    const crew = Array.isArray(request.crew) ? request.crew : [];
    
    // If no crew, create one row for the request itself
    if (crew.length === 0) {
      return [
        {
          transport_request_id: request.transport_request_id,
          wo_id: request.wo_id,
          crew_name: request.inhouse_driver_name || request.third_party_driver_name || "N/A",
          crew_change_id: null,
          pickup_status: request.status,
          from_location: request.from_location,
          to_location: request.to_location,
          pickup_datetime: request.pickup_datetime,
          request_type: request.request_type,
          transport_company: request.transport_company,
          third_party_driver_name: request.third_party_driver_name,
          third_party_driver_contact: request.third_party_driver_contact,
          inhouse_driver_name: request.inhouse_driver_name,
          request_email: request.request_email,
          remarks: request.remarks,
          status: request.status,
        },
      ];
    }
    
    // Create a row for each crew member
    return crew.map((crewMember) => ({
      transport_request_id: request.transport_request_id,
      wo_id: request.wo_id,
      crew_name: crewMember.crew_name,
      crew_change_id: crewMember.crew_change_id,
      pickup_status: crewMember.pickup_status,
      rank: crewMember.rank,
      from_location: request.from_location,
      to_location: request.to_location,
      pickup_datetime: request.pickup_datetime,
      request_type: request.request_type,
      transport_company: request.transport_company,
      third_party_driver_name: request.third_party_driver_name,
      third_party_driver_contact: request.third_party_driver_contact,
      inhouse_driver_name: request.inhouse_driver_name,
      request_email: request.request_email,
      remarks: request.remarks,
      status: request.status,
    }));
  });
};

const TRANSPORT_REQUEST_COLUMNS = [
  { key: "crew_name", header: "Crew", accessor: (r) => r?.crew_name ?? r?.crewName, type: "crew" },
  {
    key: "route",
    header: "Route",
    type: "route",
    fromAccessor: (r) => r?.from ?? r?.from_location ?? r?.pickup_location,
    toAccessor: (r) => r?.to ?? r?.to_location ?? r?.drop_location,
  },
  {
    key: "status",
    header: "Status",
    accessor: (r) => r?.status ?? r?.pickup_status,
    type: "status",
  },
  {
    key: "requested_date",
    header: "Requested",
    accessor: (r) => r?.requested_date ?? r?.pickup_datetime,
    type: "date",
  },
  { 
    key: "document", 
    header: "Document", 
    accessor: (r) => r?.request_email,
    type: "document" 
  },
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
  const documentsInputRef = useRef(null);
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

  const [transportCompanies, setTransportCompanies] = useState([]);
  const [thirdPartyDrivers, setThirdPartyDrivers] = useState([]);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingThirdPartyDrivers, setLoadingThirdPartyDrivers] = useState(false);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);
  const [transportCoordinators, setTransportCoordinators] = useState([]);
  const [isSavingTransport, setIsSavingTransport] = useState(false);
  const [transportRequests, setTransportRequests] = useState([]);
  const [loadingTransportRequests, setLoadingTransportRequests] = useState(false);
  const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCoordinators(true);
        const { data } = await callFileService.getAllTransportCoordinators();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (!cancelled) setTransportCoordinators(list);
      } catch {
        if (!cancelled) setTransportCoordinators([]);
      } finally {
        if (!cancelled) setLoadingCoordinators(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    handleChange("transportCoordinatorId")({ target: { value: "" } });
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

  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);
    const raw = Array.from(e.dataTransfer.files || []);
    if (raw.length === 0) return;
    const current = formValues.transportDocuments || [];
    const added = raw.map(fileToAttachment);
    handleChange("transportDocuments")({ target: { value: [...current, ...added] } });
  };

  const handleDocumentsFileInputChange = (e) => {
    const raw = Array.from(e.target.files || []);
    if (raw.length === 0) {
      if (requestEmailInputRef.current) {
        requestEmailInputRef.current.value = "";
      }
      return;
    }

    const current = formValues.transportDocuments || [];
    const added = raw.map(fileToAttachment);
    handleChange("transportDocuments")({ target: { value: [...current, ...added] } });
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = formValues.transportDocuments || [];
    handleChange("transportDocuments")({ target: { value: current.filter((_, i) => i !== index) } });
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
    };

    if (transportType === "inhouse") {
      payload.transport_coordinator_id = formValues.transportCoordinatorId || "";
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

    const transportDocuments = Array.isArray(formValues.transportDocuments)
      ? formValues.transportDocuments
      : [];
    transportDocuments.forEach((attachment, index) => {
      const file = attachment?.file ?? attachment;
      if (file instanceof File) {
        formData.append(`documents[${index}]`, file);
      }
    });

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

  const transportCoordinatorOptions = transportCoordinators.map((coordinator) => ({
    value: String(coordinator.user_id ?? ""),
    label: coordinator.user_name || `Coordinator ${coordinator.user_id}`,
  }));

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form transport-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card husb-accent-teal">
                <PremiumCardHeader
                  icon="transport"
                  title="New transport request"
                  subtitle="Book a vehicle for crew movement"
                  headerClassName="crew-pass-request-details-card__header"
                  titleClassName="crew-pass-request-details-card__title"
                />
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                <FormGroup icon="mail" label="Request" accent="blue">
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
                        helperText=".msg, .eml, .pdf, .doc or .docx"
                      />
                    </div>
                  </FormField>
                </FormGroup>

                <FormGroup icon="folder" label="Attachments" accent="blue">
                  <FormField label="Documents" className="cf-field-full">
                    <div className="transport-upload-box">
                      <AttachmentsList
                        attachments={formValues.transportDocuments || []}
                        onAdd={() => { }}
                        onRemove={handleDocumentsRemoveAttachment}
                        cardColor={cardColor}
                        isDragging={isDraggingDocuments}
                        onDragEnter={handleDocumentsDragEnter}
                        onDragLeave={handleDocumentsDragLeave}
                        onDragOver={handleDocumentsDragOver}
                        onDrop={handleDocumentsDrop}
                        fileInputRef={documentsInputRef}
                        onFileInputChange={handleDocumentsFileInputChange}
                        helperText="Drag files or click to browse"
                        multiple={true}
                      />
                    </div>
                  </FormField>
                </FormGroup>

                <FormGroup icon="transport" label="Provider" accent="purple">
                  <FormField label="Provider">
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
                </FormGroup>

                <FormGroup icon="transport" label={transportType === "inhouse" ? "Transport Coordinator" : "Vehicle & Driver"} accent="amber">
                  {transportType === "inhouse" && (
                    <FormField label="Transport Coordinator">
                      <FormSelect
                        value={formValues.transportCoordinatorId || ""}
                        onChange={handleChange("transportCoordinatorId")}
                        options={transportCoordinatorOptions}
                        placeholder="Select transport coordinator..."
                      />
                    </FormField>
                  )}

                  {transportType === "thirdparty" && (
                    <FieldRow>
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
                    </FieldRow>
                  )}

                </FormGroup>

                <FormGroup icon="calendar" label="Route & Schedule" accent="teal">
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

                  <div className="transport-route-row">
                    <FieldRow>
                      <FormField label="From">
                        <div className="transport-route-select-stack">
                          <FormSelect
                            value={formValues.transportFromType || ""}
                            onChange={handleChange("transportFromType")}
                            options={TRANSPORT_ROUTE_LOCATION_OPTIONS}
                            placeholder="Select from..."
                          />
                          <LocationAutocomplete
                            value={formValues.transportFrom || ""}
                            onChange={handleChange("transportFrom")}
                            placeholder="Search for a location..."
                            onLocationSelect={() => {}}
                          />
                        </div>
                      </FormField>

                      <FormField label="To">
                        <div className="transport-route-select-stack">
                          <FormSelect
                            value={formValues.transportToType || ""}
                            onChange={handleChange("transportToType")}
                            options={TRANSPORT_ROUTE_LOCATION_OPTIONS}
                            placeholder="Select to..."
                          />
                          <LocationAutocomplete
                            value={formValues.transportTo || ""}
                            onChange={handleChange("transportTo")}
                            placeholder="Search for a location..."
                            onLocationSelect={() => {}}
                          />
                        </div>
                      </FormField>
                    </FieldRow>
                  </div>
                </FormGroup>

                {transportType === "inhouse" && (
                  <FormGroup icon="billing" label="Billing" accent="rose">
                    <FormField label="Invoice Branch">
                      <FormSelect
                        value={formValues.invoiceBranch || ""}
                        onChange={handleChange("invoiceBranch")}
                        options={invoiceBranchOptions}
                        placeholder="Select invoice branch..."
                      />
                    </FormField>
                  </FormGroup>
                )}

                <FormGroup icon="notebook" label="Notes" accent="blue">
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
                </FormGroup>

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

            <div className="general-info-right crew-pass-requests-sidebar">
              <HusbandryServiceRequestsTable
                title="Transport requests"
                subtitle="All bookings for this job"
                icon="list"
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


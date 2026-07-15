import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { format, isValid, parseISO } from "date-fns";
import { FiEye } from "react-icons/fi";
import { notify } from "../../../../../../components/Toaster";
import callFileService from "../../../../../../services/callFileService";
import transportContentService from "../../../../../../services/transportContentService";
import transportCompanyService from "../../../../../../services/transportCompanyService";
import vehicleService from "../../../../../../services/vehicleService";
import { buildPickupDateTime } from "../../../../../../store/TransportContent";
import {
  FormGroup,
  FormField,
  FormSelect,
  FieldRow,
  ReactQuillEditor,
} from "../../../../CardFormTabs/Import/tabs/husbandry/components/Husbandry.components";
import {
  CREW_MANAGEMENT_SUBTABS,
  SERVICE_ACCENT,
  TRANSPORT_ROUTE_LOCATION_OPTIONS,
} from "../../../../CardFormTabs/Import/tabs/husbandry/components/Husbandry.constants";
import CrewSelectionField from "../../../../CardFormTabs/Import/tabs/husbandry/components/CrewSelectionField";
import LocationAutocomplete from "../../../../CardFormTabs/Import/tabs/husbandry/components/LocationAutocomplete";
import DateTimePickerField from "../../../../CardFormTabs/shared/components/DateTimePickerField";
import AttachmentsList from "../../../../CardFormTabs/Import/tabs/appointment/AttachmentsList";
import HusbandryServiceRequestsTable from "../../../../CardFormTabs/Import/tabs/husbandry/components/HusbandryServiceRequestsTable";
import "./CoordinatorTransportCardView.scss";

const TRANSPORT_ACCENT = SERVICE_ACCENT[CREW_MANAGEMENT_SUBTABS.TRANSPORT];
const EMPTY_DISPLAY = "—";
const REQUEST_EMAIL_ACCEPT_ATTR = ".msg,.eml,.pdf,.doc,.docx";
const REQUEST_EMAIL_EXT_RE = /\.(msg|eml|pdf|doc|docx)$/i;
const TABLE_PAGE_SIZE = 5;

const INVOICE_BRANCH_OPTIONS = [
  { value: "Sedres Dammam", label: "Sedres Dammam" },
  { value: "Sedres Rastanura", label: "Sedres Rastanura" },
  { value: "Sedres Jubail", label: "Sedres Jubail" },
  { value: "Sedres Khafji", label: "Sedres Khafji" },
  { value: "Sedres Saffaniya", label: "Sedres Saffaniya" },
];

const EMPTY_TRANSPORT_FORM = {
  requestEmail: [],
  selectedCrew: [],
  providerType: "inhouse",
  vehicleTypeId: "",
  inhouseDriverId: "",
  transportCompanyId: "",
  pickupDate: "",
  pickupTime: "",
  fromType: "",
  fromLocation: "",
  toType: "",
  toLocation: "",
  invoiceBranch: "",
  documents: [],
  remarks: "",
};

const STATUS_TONE_MAP = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  completed: "completed",
  assigned: "assigned",
  cancelled: "cancelled",
  canceled: "cancelled",
};

const resolveCallId = (cardData) =>
  cardData?.call_id ?? cardData?.callId ?? cardData?.card_call_id ?? cardData?.id ?? null;

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = typeof value === "string" ? value.trim() : String(value);
    if (text !== "") return text;
  }
  return EMPTY_DISPLAY;
};

const fileToAttachment = (file) => ({
  name: file.name,
  file,
  size: file.size,
  type: file.type,
});

const extractListEnvelope = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const flattenTransportRequestRows = (requests) => {
  if (!Array.isArray(requests)) return [];

  return requests.flatMap((request, requestIndex) => {
    const crew = Array.isArray(request?.crew) ? request.crew : [];
    const base = {
      transport_request_id: request?.transport_request_id ?? request?.id,
      wo_id: request?.wo_id ?? request?.wo_number,
      from_location: request?.from_location,
      from_location_det: request?.from_location_det,
      to_location: request?.to_location,
      to_location_det: request?.to_location_det,
      pickup_datetime: request?.pickup_datetime,
      request_email: request?.request_email,
      request_type: request?.request_type,
      transport_company: request?.transport_company,
      inhouse_driver_name: request?.inhouse_driver_name,
      third_party_driver_name: request?.third_party_driver_name,
      third_party_driver_contact: request?.third_party_driver_contact,
      remarks: request?.remarks,
      status: request?.status,
    };

    if (crew.length === 0) {
      return [
        {
          ...base,
          id: base.transport_request_id ?? `request-${requestIndex}`,
          crew_name: base.inhouse_driver_name || base.third_party_driver_name || EMPTY_DISPLAY,
          crew_change_id: null,
        },
      ];
    }

    return crew.map((member, crewIndex) => ({
      ...base,
      id: member?.crew_change_id ?? `${base.transport_request_id ?? requestIndex}-${crewIndex}`,
      crew_name: member?.crew_name ?? member?.crewName,
      crew_change_id: member?.crew_change_id,
      status: member?.pickup_status ?? member?.status ?? base.status,
    }));
  });
};

const formatPickupDateTime = (value) => {
  if (!value) return null;
  const normalized = String(value).replace(" ", "T");
  const parsed = parseISO(normalized);
  if (!isValid(parsed)) return null;
  return format(parsed, "dd/MM/yyyy HH:mm");
};

const renderStatusBadge = (status) => {
  const raw = String(status ?? "").trim();
  if (!raw) return <span className="coordinator-transport-table__empty-cell">{EMPTY_DISPLAY}</span>;
  const tone = STATUS_TONE_MAP[raw.toLowerCase()] || "default";
  return (
    <span className={`coordinator-transport-status-badge coordinator-transport-status-badge--${tone}`}>
      {raw}
    </span>
  );
};

const COORDINATOR_TRANSPORT_REQUEST_COLUMNS = [
  { key: "crew_name", header: "Crew", accessor: (r) => r?.crew_name, type: "crew" },
  {
    key: "route",
    header: "Route",
    type: "route",
    fromAccessor: (r) => r?.from_location_det || r?.from_location,
    toAccessor: (r) => r?.to_location_det || r?.to_location,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => renderStatusBadge(r?.status),
  },
  {
    key: "requested",
    header: "Requested",
    render: (r) => formatPickupDateTime(r?.pickup_datetime) || (
      <span className="coordinator-transport-table__empty-cell">{EMPTY_DISPLAY}</span>
    ),
  },
  {
    key: "document",
    header: "Document",
    render: (r) =>
      r?.request_email ? (
        <button
          type="button"
          className="crew-pass-requests-table__doc-btn"
          onClick={() => window.open(r.request_email, "_blank", "noopener,noreferrer")}
          aria-label="View document"
        >
          <FiEye size={15} />
        </button>
      ) : (
        <span className="coordinator-transport-table__empty-cell">{EMPTY_DISPLAY}</span>
      ),
  },
];

const CoordinatorTransportSummaryCard = ({ label, value }) => (
  <div className="coordinator-transport-summary-card">
    <div className="coordinator-transport-summary-label">{label}</div>
    <div className="coordinator-transport-summary-value" title={value}>
      {value}
    </div>
  </div>
);

CoordinatorTransportSummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const CoordinatorTransportCardView = ({ cardData, cardColor }) => {
  const requestEmailInputRef = useRef(null);
  const documentsInputRef = useRef(null);

  const callId = useMemo(() => resolveCallId(cardData), [cardData]);

  const [callDetails, setCallDetails] = useState(null);
  const [transportForm, setTransportForm] = useState(EMPTY_TRANSPORT_FORM);
  const [transportRequests, setTransportRequests] = useState([]);
  const [loadingTransportRequests, setLoadingTransportRequests] = useState(false);
  const [isSavingTransport, setIsSavingTransport] = useState(false);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);
  const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);

  const [transportCompanies, setTransportCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingVehicleTypes, setLoadingVehicleTypes] = useState(false);
  const [inhouseDrivers, setInhouseDrivers] = useState([]);
  const [loadingInhouseDrivers, setLoadingInhouseDrivers] = useState(false);

  const updateTransportField = useCallback((field, value) => {
    setTransportForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  useEffect(() => {
    if (!callId) {
      setCallDetails(null);
      return;
    }
    let cancelled = false;
    callFileService
      .getCallDetail(callId)
      .then(({ data }) => {
        if (!cancelled) setCallDetails(data?.data || null);
      })
      .catch(() => {
        if (!cancelled) setCallDetails(null);
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const fetchTransportRequests = useCallback(async () => {
    if (!callId) {
      setTransportRequests([]);
      setLoadingTransportRequests(false);
      return;
    }
    setLoadingTransportRequests(true);
    try {
      const response = await transportContentService.getTransportRequest(callId);
      setTransportRequests(flattenTransportRequestRows(extractListEnvelope(response)));
    } catch {
      setTransportRequests([]);
    } finally {
      setLoadingTransportRequests(false);
    }
  }, [callId]);

  useEffect(() => {
    void fetchTransportRequests();
  }, [fetchTransportRequests]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCompanies(true);
    transportCompanyService
      .getTransportCompanyData()
      .then((response) => {
        if (!cancelled) setTransportCompanies(extractListEnvelope(response));
      })
      .catch(() => {
        if (!cancelled) setTransportCompanies([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCompanies(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingVehicleTypes(true);
    vehicleService
      .getAllTransportVehicles()
      .then((response) => {
        if (!cancelled) setVehicleTypes(extractListEnvelope(response));
      })
      .catch(() => {
        if (!cancelled) setVehicleTypes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVehicleTypes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const vehicleTypeId = transportForm.vehicleTypeId;
    if (!vehicleTypeId) {
      setInhouseDrivers([]);
      return;
    }
    let cancelled = false;
    setLoadingInhouseDrivers(true);
    vehicleService
      .getDriversByVehicleType(vehicleTypeId)
      .then((response) => {
        if (!cancelled) setInhouseDrivers(extractListEnvelope(response));
      })
      .catch(() => {
        if (!cancelled) setInhouseDrivers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingInhouseDrivers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transportForm.vehicleTypeId]);

  const callTypeSummary = firstNonEmpty(callDetails?.call_type, callDetails?.call_type_name, cardData?.typeOfCall);
  const billingEntitySummary = firstNonEmpty(callDetails?.billing_entity);
  const portFromDetail =
    typeof callDetails?.port === "string"
      ? callDetails.port
      : callDetails?.port?.label || callDetails?.port?.name || "";
  const portSummary = firstNonEmpty(callDetails?.port_name, portFromDetail);
  const vesselNameSummary = firstNonEmpty(callDetails?.vessel_name, cardData?.vesselName);
  const requestedOperatorSummary = firstNonEmpty(
    callDetails?.requested_operator,
    callDetails?.requested_operator_name,
    callDetails?.assigned_operator_name,
    callDetails?.assigned_operator
  );

  const handleProviderChange = useCallback((next) => {
    setTransportForm((previous) => ({
      ...previous,
      providerType: next,
      vehicleTypeId: next === "inhouse" ? previous.vehicleTypeId : "",
      inhouseDriverId: next === "inhouse" ? previous.inhouseDriverId : "",
      invoiceBranch: next === "inhouse" ? previous.invoiceBranch : "",
      transportCompanyId: next === "thirdparty" ? previous.transportCompanyId : "",
    }));
  }, []);

  const handleVehicleTypeChange = useCallback((vehicleTypeId) => {
    setTransportForm((previous) => ({
      ...previous,
      vehicleTypeId,
      inhouseDriverId: "",
    }));
  }, []);

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
        notify("Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.", "warning", "top-center");
      }
      return;
    }
    updateTransportField("requestEmail", [fileToAttachment(allowed[0])]);
  };
  const handleRequestEmailFileInputChange = (e) => {
    const raw = Array.from(e.target.files || []);
    const allowed = filterRequestEmailFiles(raw);
    if (allowed.length === 0) {
      if (raw.length > 0) {
        notify("Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.", "warning", "top-center");
      }
    } else {
      updateTransportField("requestEmail", [fileToAttachment(allowed[0])]);
    }
    if (requestEmailInputRef.current) requestEmailInputRef.current.value = "";
  };
  const handleRequestEmailRemoveAttachment = () => updateTransportField("requestEmail", []);

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
    updateTransportField("documents", [...transportForm.documents, ...raw.map(fileToAttachment)]);
  };
  const handleDocumentsFileInputChange = (e) => {
    const raw = Array.from(e.target.files || []);
    if (raw.length > 0) {
      updateTransportField("documents", [...transportForm.documents, ...raw.map(fileToAttachment)]);
    }
    if (documentsInputRef.current) documentsInputRef.current.value = "";
  };
  const handleDocumentsRemoveAttachment = (index) =>
    updateTransportField("documents", transportForm.documents.filter((_, i) => i !== index));

  const resetForm = useCallback(() => {
    setTransportForm(EMPTY_TRANSPORT_FORM);
  }, []);

  const handleSave = useCallback(async () => {
    if (!callId) {
      notify("Call is required to save a transport request.", "error", "top-center");
      return;
    }
    if (!callDetails?.call_type_id) {
      notify("Call type id is missing. Please reload call details.", "warning", "top-center");
      return;
    }
    if (transportForm.selectedCrew.length === 0) {
      notify("Please select at least one crew member.", "error", "top-center");
      return;
    }
    if (!transportForm.pickupDate || !transportForm.pickupTime) {
      notify("Pickup date and time are required.", "error", "top-center");
      return;
    }
    if (!transportForm.fromType) {
      notify("From type is required.", "error", "top-center");
      return;
    }
    if (!transportForm.fromLocation) {
      notify("From location is required.", "error", "top-center");
      return;
    }
    if (!transportForm.toType) {
      notify("To type is required.", "error", "top-center");
      return;
    }
    if (!transportForm.toLocation) {
      notify("To location is required.", "error", "top-center");
      return;
    }
    if (transportForm.providerType === "inhouse") {
      if (!transportForm.vehicleTypeId) {
        notify("Vehicle type is required.", "error", "top-center");
        return;
      }
      if (!transportForm.inhouseDriverId) {
        notify("Inhouse driver is required.", "error", "top-center");
        return;
      }
      if (!transportForm.invoiceBranch) {
        notify("Invoice branch is required.", "error", "top-center");
        return;
      }
    } else {
      if (!transportForm.transportCompanyId) {
        notify("Transport company is required.", "error", "top-center");
        return;
      }
    }

    const payload = {
      call_id: Number(callId),
      request_type: transportForm.providerType === "thirdparty" ? "Third Party" : "Inhouse",
      pickup_datetime: buildPickupDateTime(transportForm.pickupDate, transportForm.pickupTime),
      from_location: transportForm.fromType || "",
      from_location_det: transportForm.fromLocation || "",
      to_location: transportForm.toType || "",
      to_location_det: transportForm.toLocation || "",
      remarks: transportForm.remarks || "",
      crew: transportForm.selectedCrew.map((id) => ({ crew_change_id: Number(id) })),
    };

    if (transportForm.providerType === "inhouse") {
      payload.vehicle_type_id = Number(transportForm.vehicleTypeId || "");
      payload.inhouse_driver_id = Number(transportForm.inhouseDriverId || "");
      payload.invoice_branch = transportForm.invoiceBranch || "";
    } else {
      payload.transport_company_id = Number(transportForm.transportCompanyId || "");
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    const requestEmailFile = transportForm.requestEmail?.[0]?.file;
    if (requestEmailFile) {
      formData.append("request_email", requestEmailFile);
    }

    transportForm.documents.forEach((attachment, index) => {
      const file = attachment?.file ?? attachment;
      if (file instanceof File) {
        formData.append(`documents[${index}]`, file);
      }
    });

    setIsSavingTransport(true);
    try {
      const response = await transportContentService.createTransportRequest(formData);
      notify(response?.data?.message || "Transport request created successfully", "success", "top-center");
      resetForm();
      await fetchTransportRequests();
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to create transport request", "error", "top-center");
    } finally {
      setIsSavingTransport(false);
    }
  }, [callId, callDetails, transportForm, fetchTransportRequests, resetForm]);

  const companyOptions = useMemo(
    () =>
      transportCompanies.map((c) => ({
        value: String(c?.transport_company_id ?? ""),
        label: c?.transport_company ?? "",
      })),
    [transportCompanies]
  );

  const vehicleTypeOptions = useMemo(
    () =>
      vehicleTypes.map((v) => ({
        value: String(v?.vehicle_type_id ?? ""),
        label: v?.vehicle_name ?? "",
      })),
    [vehicleTypes]
  );

  const inhouseDriverOptions = useMemo(
    () =>
      inhouseDrivers.map((d) => ({
        value: String(d?.driver_id ?? ""),
        label: d?.driver_name ?? "",
      })),
    [inhouseDrivers]
  );

  return (
    <div className="coordinator-transport-card-view" style={{ "--card-color": cardColor }}>
      <div className="coordinator-transport-content">
        <div className="coordinator-transport-summary">
          <CoordinatorTransportSummaryCard label="Call Type" value={callTypeSummary} />
          <CoordinatorTransportSummaryCard label="Billing Entity" value={billingEntitySummary} />
          <CoordinatorTransportSummaryCard label="Port" value={portSummary} />
          <CoordinatorTransportSummaryCard label="Vessel Name" value={vesselNameSummary} />
          <CoordinatorTransportSummaryCard label="Requested Operator" value={requestedOperatorSummary} />
        </div>

        <div className="coordinator-transport-workspace">
          <section className={`coordinator-transport-form-card husb-accent-${TRANSPORT_ACCENT}`}>
            <div className="coordinator-transport-form-header">
              <h3 className="coordinator-transport-form-title">New transport request</h3>
              <p className="coordinator-transport-form-subtitle">Book a vehicle for crew movement</p>
            </div>

            <div className="coordinator-transport-form-body crew-pass-thin-scrollbar">
              <div className="coordinator-transport-form-section">
                <FormGroup icon="mail" label="Request Email" accent={TRANSPORT_ACCENT}>
                  <FormField>
                    <div className="coordinator-transport-request-upload">
                      <AttachmentsList
                        attachments={transportForm.requestEmail}
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
                        helperText=".msg, .eml, .pdf, .doc or .docx"
                      />
                    </div>
                  </FormField>
                </FormGroup>
              </div>

              <div className="coordinator-transport-form-section">
                <CrewSelectionField
                  callId={callId}
                  selected={transportForm.selectedCrew}
                  onChange={(ids) => updateTransportField("selectedCrew", ids)}
                  accent={TRANSPORT_ACCENT}
                />
              </div>

              <div className="coordinator-transport-form-section">
                <FormGroup icon="transport" label="Provider" accent={TRANSPORT_ACCENT}>
                  <FormField>
                    <div className="coordinator-transport-provider-toggle">
                      <button
                        type="button"
                        className={`coordinator-transport-provider-option${
                          transportForm.providerType === "inhouse" ? " is-active" : ""
                        }`}
                        onClick={() => handleProviderChange("inhouse")}
                      >
                        In house
                      </button>
                      <button
                        type="button"
                        className={`coordinator-transport-provider-option${
                          transportForm.providerType === "thirdparty" ? " is-active" : ""
                        }`}
                        onClick={() => handleProviderChange("thirdparty")}
                      >
                        Third party
                      </button>
                    </div>
                  </FormField>
                </FormGroup>

                {transportForm.providerType === "inhouse" ? (
                  <FieldRow>
                    <FormField label="Vehicle Type">
                      <FormSelect
                        value={transportForm.vehicleTypeId}
                        onChange={(e) => handleVehicleTypeChange(e.target.value)}
                        options={vehicleTypeOptions}
                        placeholder={loadingVehicleTypes ? "Loading..." : "Select vehicle type..."}
                        disabled={loadingVehicleTypes}
                      />
                    </FormField>
                    <FormField label="Inhouse Driver">
                      <FormSelect
                        value={transportForm.inhouseDriverId}
                        onChange={(e) => updateTransportField("inhouseDriverId", e.target.value)}
                        options={inhouseDriverOptions}
                        placeholder={
                          !transportForm.vehicleTypeId
                            ? "Select vehicle type first"
                            : loadingInhouseDrivers
                              ? "Loading drivers..."
                              : "Select driver..."
                        }
                        disabled={!transportForm.vehicleTypeId || loadingInhouseDrivers}
                      />
                    </FormField>
                    <FormField label="Invoice Branch" className="cf-field-full">
                      <FormSelect
                        value={transportForm.invoiceBranch}
                        onChange={(e) => updateTransportField("invoiceBranch", e.target.value)}
                        options={INVOICE_BRANCH_OPTIONS}
                        placeholder="Select branch..."
                      />
                    </FormField>
                  </FieldRow>
                ) : (
                  <FieldRow>
                    <FormField label="Transport Company" className="cf-field-full">
                      <FormSelect
                        value={transportForm.transportCompanyId}
                        onChange={(e) => updateTransportField("transportCompanyId", e.target.value)}
                        options={companyOptions}
                        placeholder={loadingCompanies ? "Loading..." : "Select company..."}
                        disabled={loadingCompanies}
                      />
                    </FormField>
                  </FieldRow>
                )}
              </div>

              <div className="coordinator-transport-form-section">
                <FormGroup icon="calendar" label="Pickup Date Time" accent={TRANSPORT_ACCENT}>
                  <FormField>
                    <DateTimePickerField
                      dateValue={transportForm.pickupDate}
                      timeValue={transportForm.pickupTime}
                      onDateChange={(e) => updateTransportField("pickupDate", e.target.value)}
                      onTimeChange={(e) => updateTransportField("pickupTime", e.target.value)}
                    />
                  </FormField>
                </FormGroup>

                <FieldRow>
                  <FormField label="From">
                    <FormSelect
                      value={transportForm.fromType}
                      onChange={(e) => updateTransportField("fromType", e.target.value)}
                      options={TRANSPORT_ROUTE_LOCATION_OPTIONS}
                      placeholder="Select location type"
                    />
                    <LocationAutocomplete
                      value={transportForm.fromLocation}
                      onChange={(e) => updateTransportField("fromLocation", e.target.value)}
                      placeholder="Enter pickup location"
                    />
                  </FormField>
                  <FormField label="To">
                    <FormSelect
                      value={transportForm.toType}
                      onChange={(e) => updateTransportField("toType", e.target.value)}
                      options={TRANSPORT_ROUTE_LOCATION_OPTIONS}
                      placeholder="Select location type"
                    />
                    <LocationAutocomplete
                      value={transportForm.toLocation}
                      onChange={(e) => updateTransportField("toLocation", e.target.value)}
                      placeholder="Enter drop-off location"
                    />
                  </FormField>
                </FieldRow>
              </div>

              <div className="coordinator-transport-form-section">
                <FormGroup icon="folder" label="Documents" accent={TRANSPORT_ACCENT}>
                  <FormField className="cf-field-full">
                    <div className="coordinator-transport-documents-upload">
                      <AttachmentsList
                        attachments={transportForm.documents}
                        onAdd={() => {}}
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
                        multiple
                      />
                    </div>
                  </FormField>
                </FormGroup>
              </div>

              <div className="coordinator-transport-form-section">
                <FormGroup icon="notebook" label="Remarks" accent={TRANSPORT_ACCENT}>
                  <FormField>
                    <ReactQuillEditor
                      value={transportForm.remarks}
                      onChange={(e) => updateTransportField("remarks", e.target.value)}
                      placeholder="Enter remarks..."
                      name="remarks"
                    />
                  </FormField>
                </FormGroup>
              </div>
            </div>

            <div className="coordinator-transport-form-footer">
              <button
                type="button"
                className="form-save-button coordinator-transport-save-button"
                onClick={handleSave}
                disabled={isSavingTransport}
              >
                {isSavingTransport ? "Saving..." : "Save"}
              </button>
            </div>
          </section>

          <section className="coordinator-transport-table-card">
            <HusbandryServiceRequestsTable
              title="Transport requests"
              subtitle="All bookings for this job"
              icon="list"
              requests={transportRequests}
              loading={loadingTransportRequests}
              columns={COORDINATOR_TRANSPORT_REQUEST_COLUMNS}
              emptyMessage="No transport requests found"
              serviceType="transport"
              pageSize={TABLE_PAGE_SIZE}
              accent={TRANSPORT_ACCENT}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

CoordinatorTransportCardView.propTypes = {
  cardData: PropTypes.object,
  cardColor: PropTypes.string,
};

export default CoordinatorTransportCardView;

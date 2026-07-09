import { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { CREW_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import { HusbIcon } from "./Husbandry.components";
import CrewServiceSelectModal from "./CrewServiceSelectModal";
import CrewServiceListing from "./CrewServiceListing";
import CrewUploadSteps from "./CrewUploadSteps";
import CrewUploadDropzones from "./CrewUploadDropzones";
import useCrewReducer from "../../../../../../../store/CrewReducer";
import callFileService from "../../../../../../../services/callFileService";
import { notify } from "../../../../../../../components/Toaster";

const INITIAL_UPLOAD_STEPS = {
  crewList: { status: "pending", files: [], progress: 0 },
  passportIqama: { status: "pending", files: [], progress: 0 },
  visa: { status: "pending", files: [], progress: 0 },
};

// `hasServiceForm: false` means there's no existing content component to
// navigate to yet — Request just confirms the submission and returns to the
// dashboard instead of calling onNavigateToTab (see handleRequestService).
const CREW_SERVICE_CARDS = [
  {
    id: "crewChange",
    tabName: "crewChange",
    label: "Crew Change",
    description: "Request and track crew change movements for sign on/off.",
    crewField: "crewChangeSelectedCrew",
    hasServiceForm: false,
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.TRANSPORT,
    tabName: "transport",
    label: "Transport",
    description: "Arrange crew pickup and drop-off transport for sign on/off movements.",
    crewField: "selectedCrew",
    hasServiceForm: true,
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE,
    tabName: "medicalService",
    label: "Medical",
    description: "Coordinate medical checks, clinic visits and health clearance for crew.",
    crewField: "medicalServiceSelectedCrew",
    hasServiceForm: true,
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.HOTEL,
    tabName: "hotel",
    label: "Hotel",
    description: "Book crew accommodation and manage hotel stay arrangements.",
    crewField: "hotelSelectedCrew",
    hasServiceForm: true,
  },
  {
    id: "portPass",
    tabName: "portPass",
    label: "Port Pass",
    description: "Raise and track port pass requests for crew movement.",
    crewField: "portPassSelectedCrew",
    hasServiceForm: false,
  },
];

const getCrewOptionId = (crew, index) =>
  String(crew?.crew_change_id ?? crew?.crew_id ?? crew?.id ?? index);

// Static placeholder rows for the Crew Summary table below — until the
// backend exposes per-crew document/service status, these demonstrate the
// intended columns (mixed available/missing docs and service counts).
const CREW_SUMMARY_STATIC_ROWS = [
  { id: 1, crewId: 1, crewName: "Ahmed Al-Rashid", nationality: "Saudi Arabia", rank: "Chief Officer", movementType: "Sign On", passport: true, iqama: true, visa: false, cgPass: true, zawilPass: false, transportCount: 2, hotelCount: 0, medicalCount: 0 },
  { id: 2, crewId: 2, crewName: "John Smith", nationality: "United Kingdom", rank: "Master", movementType: "Sign Off", passport: true, iqama: false, visa: true, cgPass: false, zawilPass: true, transportCount: 0, hotelCount: 1, medicalCount: 0 },
  { id: 3, crewId: 3, crewName: "Maria Santos", nationality: "Philippines", rank: "Chief Cook", movementType: "Sign On", passport: false, iqama: true, visa: true, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 1 },
  { id: 4, crewId: 4, crewName: "Viktor Petrov", nationality: "Ukraine", rank: "Chief Engineer", movementType: "Sign Off", passport: true, iqama: true, visa: true, cgPass: true, zawilPass: true, transportCount: 1, hotelCount: 1, medicalCount: 0 },
  { id: 5, crewId: 5, crewName: "Raj Kumar", nationality: "India", rank: "AB Seaman", movementType: "Sign On", passport: false, iqama: false, visa: false, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 0 },
  { id: 6, crewId: 6, crewName: "Elena Kowalski", nationality: "Poland", rank: "2nd Officer", movementType: "Sign Off", passport: true, iqama: false, visa: true, cgPass: false, zawilPass: false, transportCount: 3, hotelCount: 0, medicalCount: 0 },
  { id: 7, crewId: 7, crewName: "Carlos Mendez", nationality: "Mexico", rank: "Chief Steward", movementType: "Sign On", passport: true, iqama: true, visa: false, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 2, medicalCount: 0 },
  { id: 8, crewId: 8, crewName: "Yuki Tanaka", nationality: "Japan", rank: "3rd Engineer", movementType: "Sign Off", passport: false, iqama: true, visa: true, cgPass: true, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 2 },
  { id: 9, crewId: 9, crewName: "Fatima Al-Sayed", nationality: "Egypt", rank: "Bosun", movementType: "Sign On", passport: true, iqama: true, visa: true, cgPass: false, zawilPass: true, transportCount: 1, hotelCount: 0, medicalCount: 0 },
  { id: 10, crewId: 10, crewName: "Lucas Silva", nationality: "Brazil", rank: "Oiler", movementType: "Sign Off", passport: false, iqama: false, visa: true, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 0 },
];

// Read-only doc status icon for the Passport/Iqama, Visa, CG Pass and Zawil
// Pass columns — green preview icon when the document is available, blank
// cell when it's missing (no red "missing" indicator).
const DocStatusIcon = ({ available, label }) => {
  if (!available) {
    return <div className="crew-table-cell crew-table-cell--doc-action" aria-hidden="true" />;
  }
  return (
    <div className="crew-table-cell crew-table-cell--doc-action">
      <div className="crew-doc-cell__inner">
        <span
          className="crew-doc-btn crew-doc-btn--preview"
          aria-label={`${label} available`}
          title={`${label} available`}
        >
          <svg className="crew-doc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "#00AA00" }} />
            <circle cx="12" cy="12" r="3" strokeWidth="2" style={{ stroke: "#00AA00" }} />
          </svg>
        </span>
      </div>
    </div>
  );
};

DocStatusIcon.propTypes = {
  available: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

const CarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

CarIcon.propTypes = { size: PropTypes.number };

const HotelIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

HotelIcon.propTypes = { size: PropTypes.number };

const MedicalIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

MedicalIcon.propTypes = { size: PropTypes.number };

const SERVICE_ICONS = { transport: CarIcon, hotel: HotelIcon, medical: MedicalIcon };

// Transport / Hotel / Medical column cell — green service icon when crew has
// been assigned to that service, blank otherwise (no count badge).
const ServiceStatusIcon = ({ type, active, label }) => {
  if (!active) {
    return <div className="crew-table-cell crew-service-cell crew-service-cell--empty" aria-hidden="true" />;
  }
  const Icon = SERVICE_ICONS[type];
  return (
    <div className="crew-table-cell crew-service-cell" aria-label={`${label} assigned`}>
      <div className="crew-status-icon crew-status-icon--done">
        <Icon size={14} />
      </div>
    </div>
  );
};

ServiceStatusIcon.propTypes = {
  type: PropTypes.oneOf(["transport", "hotel", "medical"]).isRequired,
  active: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

// Crew Management landing view — hero (with a compact 3-step crew document
// upload widget on the right: crew list, passport/iqama, visa), counters,
// and service cards. Each card opens a "Select Crew" popup fed by the crew
// list already uploaded here; on submit the selection is saved to the
// matching service field and the existing service form is opened via
// onNavigateToTab.
const CrewManagementDashboard = ({ formValues, handleChange, cardColor, onNavigateToTab }) => {
  const importCrewFile = useCrewReducer((state) => state.importCrewFile);
  const fetchCallCrewList = useCrewReducer((state) => state.fetchCallCrewList);

  const [uploadedCrewList, setUploadedCrewList] = useState(
    Array.isArray(formValues?.crewList) ? formValues.crewList : []
  );
  const [uploadSteps, setUploadSteps] = useState(INITIAL_UPLOAD_STEPS);

  const [selectedServiceForCrew, setSelectedServiceForCrew] = useState(null);
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [isCrewSelectModalOpen, setIsCrewSelectModalOpen] = useState(false);

  // { [tabName]: [crewIds] } — seeded from formValues so a saved selection
  // survives this component remounting (e.g. after navigating away and back).
  const [selectedServiceCrewMap, setSelectedServiceCrewMap] = useState(() =>
    CREW_SERVICE_CARDS.reduce((acc, card) => {
      const ids = formValues?.[card.crewField];
      if (Array.isArray(ids) && ids.length > 0) acc[card.tabName] = ids;
      return acc;
    }, {})
  );
  const [activeCrewListingService, setActiveCrewListingService] = useState(null);
  const [showCrewListingView, setShowCrewListingView] = useState(false);
  const [summarySelectedIds, setSummarySelectedIds] = useState([]);
  const [crewSummaryRows, setCrewSummaryRows] = useState(CREW_SUMMARY_STATIC_ROWS);
  const summaryPassportIqamaInputRef = useRef(null);
  const summaryVisaInputRef = useRef(null);

  const resolveCallAndVesselIds = useCallback(async () => {
    let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);
    let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId);

    if ((!resolvedCallId || !resolvedVesselId) && resolvedCallId) {
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] ||
          callDetailResponse?.data ||
          callDetailResponse?.detail ||
          callDetailResponse;
        if (!resolvedCallId) resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        if (!resolvedVesselId) resolvedVesselId = Number(callDetailData?.vessel_id);
      } catch {
        // resolvedCallId/resolvedVesselId stay unset — handled by callers
      }
    }

    return { resolvedCallId, resolvedVesselId };
  }, [formValues?.call_id, formValues?.callId, formValues?.vessel_id, formValues?.vesselId]);

  // Populate the crew list already uploaded for this call/vessel on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
      if (cancelled || !resolvedCallId || !resolvedVesselId) return;
      const list = await fetchCallCrewList({
        payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
      });
      if (!cancelled && Array.isArray(list)) setUploadedCrewList(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveCallAndVesselIds, fetchCallCrewList]);

  const handleCrewListFile = async (file) => {
    if (!file || uploadSteps.crewList.status === "uploading") return;
    setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "uploading" } }));

    const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
    if (!resolvedCallId || !resolvedVesselId) {
      setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "failed" } }));
      notify("Unable to upload: missing call or vessel information.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("call_id", String(resolvedCallId));
    formData.append("vessel_id", String(resolvedVesselId));
    formData.append("file", file);

    try {
      await importCrewFile({ formData });
      const list = await fetchCallCrewList({
        payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: 1, limit: 1000 },
      });
      const refreshedList = Array.isArray(list) ? list : [];
      setUploadedCrewList(refreshedList);
      handleChange("crewList")({ target: { value: refreshedList } });
      handleChange("crewCount")({ target: { value: refreshedList.length } });
      setUploadSteps((prev) => ({
        ...prev,
        crewList: { status: "completed", files: [{ name: file.name }], progress: 100 },
      }));
      notify(`Crew list uploaded — ${refreshedList.length} crew member(s) loaded.`, "success");
    } catch {
      setUploadSteps((prev) => ({ ...prev, crewList: { ...prev.crewList, status: "failed" } }));
      notify("Failed to upload crew list. Please try again.", "error");
    }
  };

  // No bulk backend endpoint exists yet for passport/iqama or visa files, so
  // these two steps are local-only — files are kept in formValues to be
  // submitted with the rest of the card, same as CrewContent's own wizard.
  const handlePassportIqamaFiles = (fileList) => {
    if (uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    handleChange("crewPassportIqamaFiles")({
      target: { value: files.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type })) },
    });
    setUploadSteps((prev) => ({ ...prev, passportIqama: { status: "completed", files, progress: 100 } }));
  };

  const handleVisaFiles = (fileList) => {
    if (uploadSteps.crewList.status !== "completed") return;
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    handleChange("crewVisaFiles")({
      target: { value: files.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type })) },
    });
    setUploadSteps((prev) => ({ ...prev, visa: { status: "completed", files, progress: 100 } }));
  };

  const handleServiceCardClick = (card) => {
    setSelectedServiceForCrew(card);
    // Default to "all crew selected" the first time a service is opened;
    // re-opening it later restores whatever was picked last.
    const existingSelection = selectedServiceCrewMap[card.tabName];
    setSelectedCrewIds(existingSelection || crewWithIds.map(({ id }) => id));
    setIsCrewSelectModalOpen(true);
  };

  const handleCloseCrewSelectModal = () => {
    setIsCrewSelectModalOpen(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  const handleSubmitCrewSelection = ({ signOnCount, signOffCount } = {}) => {
    if (!selectedServiceForCrew || selectedCrewIds.length === 0) return;
    handleChange(selectedServiceForCrew.crewField)({ target: { value: selectedCrewIds } });
    if (selectedServiceForCrew.tabName === "crewChange") {
      handleChange("crewChangeSignOnCount")({ target: { value: signOnCount } });
      handleChange("crewChangeSignOffCount")({ target: { value: signOffCount } });
    }
    setSelectedServiceCrewMap((prev) => ({ ...prev, [selectedServiceForCrew.tabName]: selectedCrewIds }));
    setActiveCrewListingService(selectedServiceForCrew);
    setShowCrewListingView(true);
    setIsCrewSelectModalOpen(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  const handleRequestService = () => {
    if (!activeCrewListingService) return;
    if (activeCrewListingService.hasServiceForm) {
      onNavigateToTab?.(activeCrewListingService.tabName);
    } else {
      // No existing form for this service yet — just confirm the request.
      notify(`${activeCrewListingService.label} request submitted.`, "success");
    }
    setShowCrewListingView(false);
    setActiveCrewListingService(null);
  };

  const handleBackToDashboardFromListing = () => {
    setShowCrewListingView(false);
    setActiveCrewListingService(null);
  };

  const crewWithIds = uploadedCrewList.map((crew, index) => ({
    crew,
    index,
    id: getCrewOptionId(crew, index),
  }));

  const handleSummaryRowToggle = (rowId) => {
    setSummarySelectedIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSummarySelectAll = () => {
    setSummarySelectedIds((prev) =>
      prev.length === crewSummaryRows.length ? [] : crewSummaryRows.map((row) => row.id)
    );
  };

  // Marks the given doc field(s) as available for every currently-checked
  // summary row — stands in for a real per-crew document upload until the
  // backend supports one, so picking a file just flips the status icon on.
  const handleSummaryBulkDocUpload = (fields) => (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || summarySelectedIds.length === 0) return;
    setCrewSummaryRows((prev) =>
      prev.map((row) =>
        summarySelectedIds.includes(row.id)
          ? { ...row, ...Object.fromEntries(fields.map((field) => [field, true])) }
          : row
      )
    );
  };

  if (showCrewListingView && activeCrewListingService) {
    const activeServiceCrewIds = selectedServiceCrewMap[activeCrewListingService.tabName] || [];
    const activeServiceCrewRows = crewWithIds.filter(({ id }) => activeServiceCrewIds.includes(id));

    return (
      <CrewServiceListing
        service={activeCrewListingService}
        crewRows={activeServiceCrewRows}
        cardColor={cardColor}
        onBack={handleBackToDashboardFromListing}
        onRequest={handleRequestService}
      />
    );
  }

  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <div className="husbandry-service-hero">
          <div className="crew-mgmt-hero-row">
            <div className="crew-mgmt-hero-text">
              <p className="husbandry-service-hero-eyebrow">Crew Management</p>
              <h2 className="husbandry-service-selection-title">Crew Management</h2>
              <p className="husbandry-service-hero-subtitle">
                Manage crew list, transport, medical, hotel and related crew services in one place.
              </p>
            </div>

            <div className="crew-mgmt-hero-uploads">
              <CrewUploadDropzones
                steps={uploadSteps}
                onSelectCrewListFile={handleCrewListFile}
                onSelectPassportIqamaFiles={handlePassportIqamaFiles}
                onSelectVisaFiles={handleVisaFiles}
              />
              <CrewUploadSteps steps={uploadSteps} />
            </div>
          </div>
        </div>

        <div className="crew-mgmt-service-grid">
          {CREW_SERVICE_CARDS.map((card) => {
            const assignedCount = selectedServiceCrewMap[card.tabName]?.length || 0;
            const isAssigned = assignedCount > 0;

            return (
              <button
                key={card.id}
                type="button"
                className="crew-mgmt-service-box"
                onClick={() => handleServiceCardClick(card)}
                style={{ "--card-color": cardColor }}
              >
                {isAssigned && (
                  <span
                    className="crew-mgmt-service-box-badge booked-status-completed"
                    aria-label={`${card.label} status: Completed`}
                  >
                    Completed
                  </span>
                )}
                <div className="crew-mgmt-service-box-icon">
                  <HusbIcon id={card.id} />
                </div>
                <div className="crew-mgmt-service-box-content">
                  <span className="crew-mgmt-service-box-label">{card.label}</span>
                  <span className="crew-mgmt-service-box-count">{assignedCount} Crew Assigned</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="crew-mgmt-summary-section">
          <div className="crew-listing-header">
            <div>
              <h2 className="crew-listing-title">Crew Summary</h2>
              <p className="crew-listing-subtitle">Overview of crew documents and assigned services.</p>
            </div>

            {summarySelectedIds.length > 0 && (
              <div className="crew-summary-bulk-actions">
                <button
                  type="button"
                  className="crew-header-btn"
                  onClick={() => summaryPassportIqamaInputRef.current?.click()}
                >
                  <span className="crew-header-btn__label">Upload Passport / Iqama</span>
                </button>
                <input
                  ref={summaryPassportIqamaInputRef}
                  type="file"
                  className="crew-doc-input"
                  onChange={handleSummaryBulkDocUpload(["passport", "iqama"])}
                />
                <button
                  type="button"
                  className="crew-header-btn"
                  onClick={() => summaryVisaInputRef.current?.click()}
                >
                  <span className="crew-header-btn__label">Upload Visa</span>
                </button>
                <input
                  ref={summaryVisaInputRef}
                  type="file"
                  className="crew-doc-input"
                  onChange={handleSummaryBulkDocUpload(["visa"])}
                />
              </div>
            )}
          </div>

          <div className="crew-table-wrapper">
            <div className="table-wrapper table-responsive crew-table-container crew-table-scroll">
              <table
                className="table table-striped crew-table crew-list-table"
                style={{ "--card-color": cardColor, tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th className="crew-checkbox-cell-header">
                      <input
                        className="crew-list-checkbox crew-list-checkbox--header"
                        type="checkbox"
                        checked={summarySelectedIds.length === crewSummaryRows.length}
                        onChange={handleSummarySelectAll}
                      />
                    </th>
                    <th><span className="crew-th">Crew name</span></th>
                    <th><span className="crew-th">Nationality</span></th>
                    <th><span className="crew-th">Rank</span></th>
                    <th><span className="crew-th">Movement type</span></th>
                    <th><span className="crew-th">Passport / Iqama</span></th>
                    <th><span className="crew-th">Visa</span></th>
                    <th><span className="crew-th">CG Pass</span></th>
                    <th><span className="crew-th">Zawil Pass</span></th>
                    <th><span className="crew-th">Transport</span></th>
                    <th><span className="crew-th">Hotel</span></th>
                    <th><span className="crew-th">Medical</span></th>
                  </tr>
                </thead>
                <tbody>
                  {crewSummaryRows.map((row) => (
                    <tr key={row.id} className={summarySelectedIds.includes(row.id) ? "crew-row-selected" : ""}>
                      <td className="crew-checkbox-cell">
                        <input
                          className="crew-list-checkbox"
                          type="checkbox"
                          checked={summarySelectedIds.includes(row.id)}
                          onChange={() => handleSummaryRowToggle(row.id)}
                        />
                      </td>
                      <td>
                        <div className="crew-table-cell crew-name-cell" title={row.crewName}>
                          <span className="crew-name-info">
                            <span className="crew-name-text">{row.crewName}</span>
                            <span className="crew-name-id">{`ID · ${String(row.crewId).padStart(5, "0")}`}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" title={row.nationality}>{row.nationality}</div>
                      </td>
                      <td>
                        <div className="crew-table-cell" title={row.rank}>{row.rank}</div>
                      </td>
                      <td>
                        <span className="crew-movement-pill" title={row.movementType}>{row.movementType}</span>
                      </td>
                      <td><DocStatusIcon available={row.passport || row.iqama} label="Passport / Iqama" /></td>
                      <td><DocStatusIcon available={row.visa} label="Visa" /></td>
                      <td><DocStatusIcon available={row.cgPass} label="CG Pass" /></td>
                      <td><DocStatusIcon available={row.zawilPass} label="Zawil Pass" /></td>
                      <td><ServiceStatusIcon type="transport" active={row.transportCount > 0} label="Transport" /></td>
                      <td><ServiceStatusIcon type="hotel" active={row.hotelCount > 0} label="Hotel" /></td>
                      <td><ServiceStatusIcon type="medical" active={row.medicalCount > 0} label="Medical" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CrewServiceSelectModal
        show={isCrewSelectModalOpen}
        service={selectedServiceForCrew}
        crewRows={crewWithIds}
        selectedCrewIds={selectedCrewIds}
        onChangeSelected={setSelectedCrewIds}
        cardColor={cardColor}
        onClose={handleCloseCrewSelectModal}
        onSubmit={handleSubmitCrewSelection}
      />
    </div>
  );
};

CrewManagementDashboard.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onNavigateToTab: PropTypes.func,
};

export default CrewManagementDashboard;

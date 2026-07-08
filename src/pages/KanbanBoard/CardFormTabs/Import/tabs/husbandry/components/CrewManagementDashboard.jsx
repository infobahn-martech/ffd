import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { CREW_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import { HusbIcon } from "./Husbandry.components";
import CrewServiceSelectModal from "./CrewServiceSelectModal";
import CrewServiceListing from "./CrewServiceListing";
import useCrewReducer from "../../../../../../../store/CrewReducer";
import callFileService from "../../../../../../../services/callFileService";

const CREW_SERVICE_CARDS = [
  {
    id: CREW_MANAGEMENT_SUBTABS.TRANSPORT,
    tabName: "transport",
    label: "Transport",
    description: "Arrange crew pickup and drop-off transport for sign on/off movements.",
    crewField: "selectedCrew",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE,
    tabName: "medicalService",
    label: "Medical",
    description: "Coordinate medical checks, clinic visits and health clearance for crew.",
    crewField: "medicalServiceSelectedCrew",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.HOTEL,
    tabName: "hotel",
    label: "Hotel",
    description: "Book crew accommodation and manage hotel stay arrangements.",
    crewField: "hotelSelectedCrew",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.CG_PASS,
    tabName: "cgPass",
    label: "CG Pass",
    description: "Raise and track Coast Guard pass requests for crew movement.",
    crewField: "cgPassSelectedCrew",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS,
    tabName: "zawilPass",
    label: "Zawil Pass",
    description: "Raise and track Zawil pass requests for crew movement.",
    crewField: "zawilPassSelectedCrew",
  },
  {
    id: "LAUNCH_HIRE",
    tabName: "launchHire",
    label: "Launch Hire",
    description: "Book launch transfers for crew change and related movements.",
    crewField: "launchHireSelectedCrew",
  },
];

const normalizeMovement = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

const getCrewOptionId = (crew, index) =>
  String(crew?.crew_change_id ?? crew?.crew_id ?? crew?.id ?? index);

// e.g. "Ahmed Al-Rashid - Chief Officer - Saudi Arabia" — rank/nationality
// are appended only when present on the record.
const getCrewOptionLabel = (crew, index) => {
  const name = crew?.crew_name || crew?.crewName || crew?.name || `Crew Member ${index + 1}`;
  const parts = [name];
  if (crew?.rank) parts.push(crew.rank);
  if (crew?.nationality) parts.push(crew.nationality);
  return parts.join(" - ");
};

// Crew Management landing view — hero, counters, an inline drag-and-drop
// crew upload card (auto-uploads on file select, no separate modal), and
// service cards. Each card opens a "Select Crew" popup fed by the crew list
// already uploaded here; on submit the selection is saved to the matching
// service field and the existing service form is opened via onNavigateToTab.
const CrewManagementDashboard = ({ formValues, handleChange, cardColor, onNavigateToTab }) => {
  const importCrewFile = useCrewReducer((state) => state.importCrewFile);
  const fetchCallCrewList = useCrewReducer((state) => state.fetchCallCrewList);

  const [uploadedCrewList, setUploadedCrewList] = useState(
    Array.isArray(formValues?.crewList) ? formValues.crewList : []
  );
  const [isUploadingCrew, setIsUploadingCrew] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null); // { type: 'success' | 'error', text }
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const totalCrew = uploadedCrewList.length;
  const signOnCount = uploadedCrewList.filter(
    (row) => normalizeMovement(row?.movementType || row?.movement_type || row?.signOnOff) === "signon"
  ).length;
  const signOffCount = uploadedCrewList.filter(
    (row) => normalizeMovement(row?.movementType || row?.movement_type || row?.signOnOff) === "signoff"
  ).length;

  const completedServicesCount = CREW_SERVICE_CARDS.filter(
    (card) => (selectedServiceCrewMap[card.tabName]?.length || 0) > 0
  ).length;
  const pendingServicesCount = CREW_SERVICE_CARDS.length - completedServicesCount;

  const summaryCards = [
    { label: "Total Crew", value: totalCrew },
    { label: "Sign On", value: signOnCount },
    { label: "Sign Off", value: signOffCount },
    { label: "Pending Services", value: pendingServicesCount },
    { label: "Completed Services", value: completedServicesCount },
  ];

  const uploadCrewFile = async (file) => {
    if (!file || isUploadingCrew) return;
    setIsUploadingCrew(true);
    setUploadMessage(null);

    const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
    if (!resolvedCallId || !resolvedVesselId) {
      setUploadMessage({ type: "error", text: "Unable to upload: missing call or vessel information." });
      setIsUploadingCrew(false);
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
      setUploadMessage({ type: "success", text: `Crew list uploaded — ${refreshedList.length} crew member(s) loaded.` });
    } catch {
      setUploadMessage({ type: "error", text: "Failed to upload crew list. Please try again." });
    } finally {
      setIsUploadingCrew(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    uploadCrewFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadingCrew) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploadingCrew) return;
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleServiceCardClick = (card) => {
    setSelectedServiceForCrew(card);
    setSelectedCrewIds(selectedServiceCrewMap[card.tabName] || []);
    setIsCrewSelectModalOpen(true);
  };

  const handleCloseCrewSelectModal = () => {
    setIsCrewSelectModalOpen(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  const handleSubmitCrewSelection = () => {
    if (!selectedServiceForCrew || selectedCrewIds.length === 0) return;
    handleChange(selectedServiceForCrew.crewField)({ target: { value: selectedCrewIds } });
    setSelectedServiceCrewMap((prev) => ({ ...prev, [selectedServiceForCrew.tabName]: selectedCrewIds }));
    setActiveCrewListingService(selectedServiceForCrew);
    setShowCrewListingView(true);
    setIsCrewSelectModalOpen(false);
    setSelectedServiceForCrew(null);
    setSelectedCrewIds([]);
  };

  const handleRequestService = () => {
    if (!activeCrewListingService) return;
    onNavigateToTab?.(activeCrewListingService.tabName);
    setShowCrewListingView(false);
    setActiveCrewListingService(null);
  };

  const handleBackToDashboardFromListing = () => {
    setShowCrewListingView(false);
    setActiveCrewListingService(null);
  };

  const handleRemoveCrewFromListing = (crewId) => {
    if (!activeCrewListingService) return;
    const tabName = activeCrewListingService.tabName;
    const updatedIds = (selectedServiceCrewMap[tabName] || []).filter((id) => id !== crewId);
    setSelectedServiceCrewMap((prev) => ({ ...prev, [tabName]: updatedIds }));
    handleChange(activeCrewListingService.crewField)({ target: { value: updatedIds } });
  };

  const crewWithIds = uploadedCrewList.map((crew, index) => ({
    crew,
    index,
    id: getCrewOptionId(crew, index),
  }));

  const crewOptions = crewWithIds.map(({ crew, index, id }) => ({
    value: id,
    label: getCrewOptionLabel(crew, index),
  }));

  const compactStateClass = isUploadingCrew
    ? "crew-upload-compact--uploading"
    : uploadMessage
      ? `crew-upload-compact--${uploadMessage.type}`
      : isDragging
        ? "crew-upload-compact--active"
        : "";

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
        onRemoveCrew={handleRemoveCrewFromListing}
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

            <div
              className={`crew-upload-compact ${compactStateClass}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploadingCrew && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              title={uploadMessage?.text}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="crew-upload-compact__input"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {isUploadingCrew ? (
                <>
                  <span className="crew-upload-compact__spinner" aria-hidden="true" />
                  <span className="crew-upload-compact__text">Uploading…</span>
                </>
              ) : uploadMessage ? (
                <>
                  <span
                    className={`crew-upload-compact__status-icon crew-upload-compact__status-icon--${uploadMessage.type}`}
                    aria-hidden="true"
                  >
                    {uploadMessage.type === "success" ? "✓" : "!"}
                  </span>
                  <span className="crew-upload-compact__body">
                    <span className="crew-upload-compact__text">
                      {uploadMessage.type === "success" ? "Crew list uploaded" : "Upload failed"}
                    </span>
                    <span className="crew-upload-compact__accept">Tap to upload another</span>
                  </span>
                </>
              ) : (
                <>
                  <svg className="crew-upload-compact__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 15V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="crew-upload-compact__body">
                    <span className="crew-upload-compact__text">
                      Drop crew file or <span className="crew-upload-compact__browse">browse</span>
                    </span>
                    <span className="crew-upload-compact__accept">.xlsx, .xls, .csv</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="husbandry-service-summary-grid crew-mgmt-summary-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="husbandry-service-summary-card">
              <span className="husbandry-service-summary-label">{card.label}</span>
              <span className="husbandry-service-summary-value">{card.value}</span>
            </div>
          ))}
        </div>

        <div className="husbandry-service-options">
          {CREW_SERVICE_CARDS.map((card) => {
            const assignedCount = selectedServiceCrewMap[card.tabName]?.length || 0;
            const isAssigned = assignedCount > 0;

            return (
              <button
                key={card.id}
                type="button"
                className="husbandry-service-option"
                onClick={() => handleServiceCardClick(card)}
                style={{ "--card-color": cardColor }}
              >
                {isAssigned && (
                  <span
                    className="husbandry-service-option-status booked-status-completed"
                    aria-label={`${card.label} status: Completed`}
                  >
                    Completed
                  </span>
                )}
                <div className="husbandry-service-option-icon">
                  <HusbIcon id={card.id} />
                </div>
                <div className="husbandry-service-option-content">
                  <span className="husbandry-service-option-label">{card.label}</span>
                  <p className="husbandry-service-option-summary">{card.description}</p>
                </div>
                {isAssigned && (
                  <div className="husbandry-service-option-footer">
                    <span className="husbandry-service-option-meta">{assignedCount} Crew Assigned</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <CrewServiceSelectModal
        show={isCrewSelectModalOpen}
        service={selectedServiceForCrew}
        crewOptions={crewOptions}
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

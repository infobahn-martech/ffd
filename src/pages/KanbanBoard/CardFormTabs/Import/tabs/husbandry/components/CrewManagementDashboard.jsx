import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { CREW_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import { HusbIcon } from "./Husbandry.components";
import CrewServiceSelectModal from "./CrewServiceSelectModal";
import CrewServiceListing from "./CrewServiceListing";
import CrewUploadSteps from "./CrewUploadSteps";
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

const normalizeMovement = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

const getCrewOptionId = (crew, index) =>
  String(crew?.crew_change_id ?? crew?.crew_id ?? crew?.id ?? index);

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

            <CrewUploadSteps
              steps={uploadSteps}
              onSelectCrewListFile={handleCrewListFile}
              onSelectPassportIqamaFiles={handlePassportIqamaFiles}
              onSelectVisaFiles={handleVisaFiles}
            />
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

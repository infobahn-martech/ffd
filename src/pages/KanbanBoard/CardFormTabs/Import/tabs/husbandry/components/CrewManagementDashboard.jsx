import { useState } from "react";
import PropTypes from "prop-types";
import { CREW_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import { HusbIcon } from "./Husbandry.components";
import CrewContent from "./CrewContent";
import CrewServiceSelectModal from "./CrewServiceSelectModal";

const CREW_SERVICE_CARDS = [
  {
    id: CREW_MANAGEMENT_SUBTABS.TRANSPORT,
    tabName: "transport",
    label: "Transport",
    description: "Arrange crew pickup and drop-off transport for sign on/off movements.",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE,
    tabName: "medicalService",
    label: "Medical",
    description: "Coordinate medical checks, clinic visits and health clearance for crew.",
  },
  {
    id: CREW_MANAGEMENT_SUBTABS.HOTEL,
    tabName: "hotel",
    label: "Hotel",
    description: "Book crew accommodation and manage hotel stay arrangements.",
  },
  {
    id: "crewChange",
    tabName: "crewChange",
    label: "Crew Change",
    description: "Request and track crew change movements for sign on/off.",
  },
  {
    id: "portPass",
    tabName: "portPass",
    label: "Port Pass",
    description: "Raise and track port pass requests for crew movement.",
  },
];

const normalizeMovement = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

// Crew Management landing view — hero + counters + service cards. Upload
// excel/table flow (existing CrewContent) is opt-in via "Upload Crew List".
// Each service card opens a crew-selection popup (CrewServiceSelectModal)
// rather than navigating into a full sub-tab form.
const CrewManagementDashboard = ({ formValues, handleChange, cardColor, onNavigateToTab, launchHireOnly = false }) => {
  const [showCrewUploadView, setShowCrewUploadView] = useState(false);
  const [activeServiceCard, setActiveServiceCard] = useState(null);
  const [serviceAssignments, setServiceAssignments] = useState({});

  const crewList = Array.isArray(formValues?.crewList) ? formValues.crewList : [];
  const totalCrew = typeof formValues?.crewCount === "number" ? formValues.crewCount : crewList.length;

  const signOnCount = crewList.filter(
    (row) => normalizeMovement(row?.movementType || row?.signOnOff) === "signon"
  ).length;
  const signOffCount = crewList.filter(
    (row) => normalizeMovement(row?.movementType || row?.signOnOff) === "signoff"
  ).length;

  const completedServicesCount = CREW_SERVICE_CARDS.filter(
    (card) => (serviceAssignments[card.tabName]?.length || 0) > 0
  ).length;
  const pendingServicesCount = CREW_SERVICE_CARDS.length - completedServicesCount;

  const summaryCards = [
    { label: "Total Crew", value: totalCrew },
    { label: "Sign On", value: signOnCount },
    { label: "Sign Off", value: signOffCount },
    { label: "Pending Services", value: pendingServicesCount },
    { label: "Completed Services", value: completedServicesCount },
  ];

  const handleServiceSubmit = (selectedCrewIds, service) => {
    setServiceAssignments((prev) => ({ ...prev, [service.tabName]: selectedCrewIds }));
    handleChange(`${service.tabName}SelectedCrew`)({ target: { value: selectedCrewIds } });
    setActiveServiceCard(null);
  };

  if (showCrewUploadView) {
    return (
      <div className="crew-mgmt-upload-view" style={{ "--card-color": cardColor }}>
        <div className="crew-mgmt-upload-header">
          <button
            type="button"
            className="crew-mgmt-back-link"
            onClick={() => setShowCrewUploadView(false)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Crew Dashboard</span>
          </button>
        </div>
        <CrewContent
          formValues={formValues}
          handleChange={handleChange}
          cardColor={cardColor}
          onNavigateToTab={onNavigateToTab}
          launchHireOnly={launchHireOnly}
        />
      </div>
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
            <button
              type="button"
              className="crew-mgmt-hero-cta"
              onClick={() => setShowCrewUploadView(true)}
            >
              Upload Crew List
            </button>
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
            const assignedCount = serviceAssignments[card.tabName]?.length || 0;
            const isAssigned = assignedCount > 0;

            return (
              <button
                key={card.id}
                type="button"
                className="husbandry-service-option"
                onClick={() => setActiveServiceCard(card)}
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
        show={Boolean(activeServiceCard)}
        service={activeServiceCard}
        crewList={crewList}
        cardColor={cardColor}
        onClose={() => setActiveServiceCard(null)}
        onSubmit={handleServiceSubmit}
      />
    </div>
  );
};

CrewManagementDashboard.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onNavigateToTab: PropTypes.func,
  launchHireOnly: PropTypes.bool,
};

export default CrewManagementDashboard;

import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import "../../../design/scss/operations.scss";
import "../../../design/scss/table-common.scss";

// Import constants
import {
  MAIN_TABS,
  CREW_MANAGEMENT_SUBTABS,
  MATERIAL_MANAGEMENT_SUBTABS,
} from "./Husbandry/Husbandry.constants";

// Import shared components
import { HusbandryTabs } from "./Husbandry/Husbandry.components";

// Import content components
import CrewContent from "./Husbandry/CrewContent";
import TransportContent from "./Husbandry/TransportContent";
import CGPassContent from "./Husbandry/CGPassContent";
import ZawilPassContent from "./Husbandry/ZawilPassContent";
import LaunchHireContent from "./Husbandry/LaunchHireContent";
import HotelContent from "./Husbandry/HotelContent";
import MedicalServiceContent from "./Husbandry/MedicalServiceContent";
import WasteDisposalContent from "./Husbandry/WasteDisposalContent";
import MaterialManagementContent from "./Husbandry/MaterialManagementContent";

// Service Selection Component
const ServiceSelection = ({ onSelectService, cardColor }) => {
  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <h2 className="husbandry-service-selection-title">What services do you need?</h2>
        <div className="husbandry-service-options">
          <button
            type="button"
            className="husbandry-service-option"
            onClick={() => onSelectService(MAIN_TABS.CREW_MANAGEMENT)}
            style={{ "--card-color": cardColor }}
          >
            <div className="husbandry-service-option-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M24 12V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="husbandry-service-option-label">Crew Management</span>
          </button>
          <button
            type="button"
            className="husbandry-service-option"
            onClick={() => onSelectService(MAIN_TABS.MATERIAL_MANAGEMENT)}
            style={{ "--card-color": cardColor }}
          >
            <div className="husbandry-service-option-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M16 20H32M16 24H32M16 28H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="husbandry-service-option-label">Material Management</span>
          </button>
          <button
            type="button"
            className="husbandry-service-option"
            onClick={() => onSelectService("BOTH")}
            style={{ "--card-color": cardColor }}
          >
            <div className="husbandry-service-option-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M24 16V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="husbandry-service-option-label">Both</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ServiceSelection.propTypes = {
  onSelectService: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Main Husbandry Component
function Husbandry({ card, formValues, handleChange }) {
  const [serviceSelected, setServiceSelected] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]); // Array to track selected services
  const [activeMainTab, setActiveMainTab] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(
    CREW_MANAGEMENT_SUBTABS.CREW
  );
  const [selectedActionTab, setSelectedActionTab] = useState(null);
  const cardColor = card?.color || "#2A00FF";


  const handleServiceSelect = useCallback((tab) => {
    setServiceSelected(true);
    setSelectedActionTab(null); // Reset selected action
    
    // Handle "BOTH" selection
    if (tab === "BOTH") {
      setSelectedServices([MAIN_TABS.CREW_MANAGEMENT, MAIN_TABS.MATERIAL_MANAGEMENT]);
      setActiveMainTab(MAIN_TABS.CREW_MANAGEMENT); // Default to Crew Management
      setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    } else {
      // Single service selection
      setSelectedServices([tab]);
      setActiveMainTab(tab);
      // Reset to default sub-tab when service is selected
      if (tab === MAIN_TABS.CREW_MANAGEMENT) {
        setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
      } else if (tab === MAIN_TABS.MATERIAL_MANAGEMENT) {
        setActiveSubTab(MATERIAL_MANAGEMENT_SUBTABS.MATERIAL_LIST);
      }
    }
  }, []);

  const handleMainTabChange = useCallback((tab) => {
    setActiveMainTab(tab);
    setSelectedActionTab(null); // Reset selected action when switching main tabs
    // Reset to default sub-tab when main tab changes
    if (tab === MAIN_TABS.CREW_MANAGEMENT) {
      setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    } else if (tab === MAIN_TABS.MATERIAL_MANAGEMENT) {
      setActiveSubTab(MATERIAL_MANAGEMENT_SUBTABS.MATERIAL_LIST);
    }
  }, []);

  const handleSubTabChange = useCallback((tab) => {
    setActiveSubTab(tab);
    // Track selected action tab when user manually clicks on a submenu item
    if (tab === CREW_MANAGEMENT_SUBTABS.CREW) {
      // Reset to show only Crew when Crew is clicked
      setSelectedActionTab(null);
    } else {
      // Show only the selected action tab
      setSelectedActionTab(tab);
    }
  }, []);

  // Handle navigation from CrewContent when crew is selected and action is chosen
  const handleNavigateToTab = useCallback((tabName) => {
    // Ensure we're on the Crew Management main tab
    if (activeMainTab !== MAIN_TABS.CREW_MANAGEMENT) {
      setActiveMainTab(MAIN_TABS.CREW_MANAGEMENT);
    }

    // Map tab names to subtab constants - tabName matches the constant values
    const tabMap = {
      transport: CREW_MANAGEMENT_SUBTABS.TRANSPORT,
      cgPass: CREW_MANAGEMENT_SUBTABS.CG_PASS,
      zawilPass: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS,
      launchHire: CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE,
      hotel: CREW_MANAGEMENT_SUBTABS.HOTEL,
      medicalService: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE,
    };

    const targetTab = tabMap[tabName];
    if (targetTab) {
      setActiveSubTab(targetTab);
      // Set the selected action tab to show only this submenu item
      setSelectedActionTab(targetTab);
    }
  }, [activeMainTab]);

  const handleBackToServiceSelection = useCallback(() => {
    setServiceSelected(false);
    setSelectedServices([]);
    setActiveMainTab(null);
    setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    setSelectedActionTab(null);
  }, []);

  const renderCrewManagementContent = () => {
    switch (activeSubTab) {
      case CREW_MANAGEMENT_SUBTABS.CREW:
        return (
          <CrewContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.TRANSPORT:
        return (
          <TransportContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.CG_PASS:
        return (
          <CGPassContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS:
        return (
          <ZawilPassContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE:
        return (
          <LaunchHireContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.HOTEL:
        return (
          <HotelContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE:
        return (
          <MedicalServiceContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      default:
        return (
          <CrewContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
            onNavigateToTab={handleNavigateToTab}
          />
        );
    }
  };

  const renderMaterialManagementContent = () => {
    switch (activeSubTab) {
      case MATERIAL_MANAGEMENT_SUBTABS.MATERIAL_LIST:
        return (
          <MaterialManagementContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case MATERIAL_MANAGEMENT_SUBTABS.WASTE_DISPOSAL:
        return (
          <WasteDisposalContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      default:
        return (
          <MaterialManagementContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
    }
  };

  // Show service selection if no service has been selected
  if (!serviceSelected) {
    return (
      <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
        <ServiceSelection onSelectService={handleServiceSelect} cardColor={cardColor} />
      </div>
    );
  }

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <HusbandryTabs
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
          onMainTabChange={handleMainTabChange}
          onSubTabChange={handleSubTabChange}
          selectedActionTab={selectedActionTab}
          selectedServices={selectedServices}
          onBackToServiceSelection={handleBackToServiceSelection}
          cardColor={cardColor}
        />
        <div className="operation-right">
          {activeMainTab === MAIN_TABS.CREW_MANAGEMENT &&
            renderCrewManagementContent()}
          {activeMainTab === MAIN_TABS.MATERIAL_MANAGEMENT &&
            renderMaterialManagementContent()}
        </div>
      </div>
    </div>
  );
}

Husbandry.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default Husbandry;

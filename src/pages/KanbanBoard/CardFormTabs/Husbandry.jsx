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
import HotelContent from "./Husbandry/HotelContent";
import MedicalServiceContent from "./Husbandry/MedicalServiceContent";
import WasteDisposalContent from "./Husbandry/WasteDisposalContent";

// Main Husbandry Component
function Husbandry({ card, formValues, handleChange }) {
  const [activeMainTab, setActiveMainTab] = useState(MAIN_TABS.CREW_MANAGEMENT);
  const [activeSubTab, setActiveSubTab] = useState(
    CREW_MANAGEMENT_SUBTABS.CREW
  );
  const cardColor = card?.color || "#2A00FF";


  const handleMainTabChange = useCallback((tab) => {
    // Disable Material Management tab for now
    if (tab === MAIN_TABS.MATERIAL_MANAGEMENT) {
      return; // Prevent switching to Material Management
    }
    setActiveMainTab(tab);
    // Reset to Crew sub-tab when main tab changes
    if (tab === MAIN_TABS.CREW_MANAGEMENT) {
      setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    }
  }, []);

  const handleSubTabChange = useCallback((tab) => {
    setActiveSubTab(tab);
  }, []);

  const renderCrewManagementContent = () => {
    switch (activeSubTab) {
      case CREW_MANAGEMENT_SUBTABS.CREW:
        return (
          <CrewContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
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
          />
        );
    }
  };

  const renderMaterialManagementContent = () => {
    switch (activeSubTab) {
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
          <WasteDisposalContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
    }
  };

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <HusbandryTabs
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
          onMainTabChange={handleMainTabChange}
          onSubTabChange={handleSubTabChange}
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

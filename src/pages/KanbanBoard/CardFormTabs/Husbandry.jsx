import { useState, useCallback, useRef, useEffect } from "react";
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
import InboundOrdersContent from "./Husbandry/InboundOrdersContent";
import LandingNoteContent from "./Husbandry/LandingNoteContent";
import DispatchNoteContent from "./Husbandry/DispatchNoteContent";
import MWPRenewalContent from "./Husbandry/MWPRenewalContent";
import OnStationContent from "./Husbandry/OnStationContent";
import ThirdPartyServicesContent from "./Husbandry/ThirdPartyServicesContent";

// Service Selection Component
const ServiceSelection = ({ onSelectService, cardColor, bookedServices = [] }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);
  const bookedServicesScrollRef = useRef(null);

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons]);

  // Ensure booked services list can scroll to bottom
  useEffect(() => {
    if (bookedServicesScrollRef.current && bookedServices.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const container = bookedServicesScrollRef.current;
        if (container) {
          // Ensure scroll height includes all content
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          // If content is scrollable, ensure we can scroll to bottom
          if (scrollHeight > clientHeight) {
            // This ensures the scroll container is properly sized
            container.style.maxHeight = `${clientHeight}px`;
          }
        }
      }, 100);
    }
  }, [bookedServices]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const services = [
    { id: MAIN_TABS.CREW_MANAGEMENT, label: "Crew Management", icon: "clock" },
    // { id: MAIN_TABS.ON_STATION, label: "On station", icon: "document" },
    { id: MAIN_TABS.MATERIAL_MANAGEMENT, label: "Material Management", icon: "document" },
    { id: MAIN_TABS.WASTE_DISPOSAL, label: "Waste Disposal", icon: "document" },
    { id: "LAUNCH_HIRE", label: "Launch Hire", icon: "document" },
    { id: MAIN_TABS.MWP_RENEWAL, label: "MWP Renewal", icon: "renewal" },
    { id: MAIN_TABS.THIRD_PARTY_SERVICES, label: "Third-Party Services", icon: "document" },
  ];

  const getServiceIcon = (iconType) => {
    switch (iconType) {
      case "clock":
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M24 12V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "renewal":
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M28 16L32 12L28 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 32L16 36L20 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 12C30 16 28 20 28 24C28 28 30 32 32 36M16 12C18 16 20 20 20 24C20 28 18 32 16 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M16 20H32M16 24H32M16 28H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      "Pending": "booked-status-pending",
      "In Progress": "booked-status-in-progress",
      "Completed": "booked-status-completed",
      "Cancelled": "booked-status-cancelled",
    };
    return statusMap[status] || "booked-status-pending";
  };

  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <h2 className="husbandry-service-selection-title">What services do you need?</h2>
        <div className="husbandry-service-scroll-wrapper">
          {showLeftArrow && (
            <button
              type="button"
              className="husbandry-scroll-button husbandry-scroll-button-left"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="husbandry-service-options-row" ref={scrollContainerRef}>
            {services.map((service) => {
              const isBooked = bookedServices.some(bs => bs.id === service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  className={`husbandry-service-option ${isBooked ? "booked" : ""}`}
                  onClick={() => onSelectService(service.id)}
                  style={{ "--card-color": cardColor }}
                >
                  <div className="husbandry-service-option-icon">
                    {getServiceIcon(service.icon)}
                  </div>
                  <span className="husbandry-service-option-label">{service.label}</span>
                  {isBooked && (
                    <div className="husbandry-service-booked-badge">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" fill="#00B894" stroke="#00B894" strokeWidth="2" />
                        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {showRightArrow && (
            <button
              type="button"
              className="husbandry-scroll-button husbandry-scroll-button-right"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {bookedServices.length > 0 && (
          <div className="husbandry-booked-services-section">
            <h3 className="husbandry-booked-services-title">Booked Services</h3>
            <div className="husbandry-booked-services-list" ref={bookedServicesScrollRef}>
              {bookedServices.map((service) => (
                <div key={service.id} className="husbandry-booked-service-item">
                  <div className="husbandry-booked-service-info">
                    <div className="husbandry-booked-service-icon">
                      {getServiceIcon(services.find(s => s.id === service.id)?.icon || "document")}
                    </div>
                    <div className="husbandry-booked-service-details">
                      <span className="husbandry-booked-service-name">
                        {services.find(s => s.id === service.id)?.label || service.id}
                      </span>
                      {service.subService && (
                        <span className="husbandry-booked-service-sub">{service.subService}</span>
                      )}
                    </div>
                  </div>
                  <div className={`husbandry-booked-service-status ${getStatusBadgeClass(service.status)}`}>
                    {service.status || "Pending"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ServiceSelection.propTypes = {
  onSelectService: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  bookedServices: PropTypes.array,
};

// Dummy crew data for DA module Husbandry tab
const DAMODULE_CREW_DUMMY = [
  { crewName: "Ahmed Al-Rashid", nationality: "Saudi Arabia", rank: "Chief Officer", passportNo: "A12345678", iqamaNo: "IQ-987654", visaNo: "V-2024-001", service: "Transport" },
  { crewName: "John Smith", nationality: "United Kingdom", rank: "Master", passportNo: "UK4521987", iqamaNo: "IQ-112233", visaNo: "V-2024-002", service: "Launch Hire" },
  { crewName: "Maria Santos", nationality: "Philippines", rank: "Chief Cook", passportNo: "PH7890123", iqamaNo: "IQ-445566", visaNo: "V-2024-003", service: "Hotel" },
  { crewName: "Viktor Petrov", nationality: "Ukraine", rank: "Chief Engineer", passportNo: "UA3456789", iqamaNo: "IQ-778899", visaNo: "V-2024-004", service: "CG Pass" },
  { crewName: "Raj Kumar", nationality: "India", rank: "AB Seaman", passportNo: "IN5678901", iqamaNo: "IQ-223344", visaNo: "V-2024-005", service: "Waste Disposal" },
  { crewName: "Elena Kowalski", nationality: "Poland", rank: "2nd Officer", passportNo: "PL2345678", iqamaNo: "IQ-556677", visaNo: "V-2024-006", service: "Inbound Orders" },
  { crewName: "Carlos Mendez", nationality: "Mexico", rank: "Chief Steward", passportNo: "MX8765432", iqamaNo: "IQ-998877", visaNo: "V-2024-007", service: "Medical Service" },
  { crewName: "Yuki Tanaka", nationality: "Japan", rank: "3rd Engineer", passportNo: "JP1122334", iqamaNo: "IQ-334455", visaNo: "V-2024-008", service: "Zawil Pass" },
  { crewName: "Fatima Hassan", nationality: "Egypt", rank: "AB Seaman", passportNo: "EG5678901", iqamaNo: "IQ-667788", visaNo: "V-2024-009", service: "On Station" },
  { crewName: "James O'Brien", nationality: "Ireland", rank: "Chief Officer", passportNo: "IE9900112", iqamaNo: "IQ-221133", visaNo: "V-2024-010", service: "MWP Renewal" },
];

// Main Husbandry Component
function Husbandry({ card, formValues, handleChange, isDAModule = false }) {
  const [serviceSelected, setServiceSelected] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]); // Array to track selected services
  const [activeMainTab, setActiveMainTab] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(
    CREW_MANAGEMENT_SUBTABS.CREW
  );
  const [selectedActionTab, setSelectedActionTab] = useState(null);
  const [isLaunchHireMode, setIsLaunchHireMode] = useState(false);
  // Initialize with dummy booked services for view-only mode (only for DA routes)
  const [bookedServices, setBookedServices] = useState(isDAModule ? [
    { id: MAIN_TABS.CREW_MANAGEMENT, status: "In Progress", subService: "Transport" },
    { id: MAIN_TABS.ON_STATION, status: "Pending", subService: null },
    { id: MAIN_TABS.MATERIAL_MANAGEMENT, status: "Completed", subService: "Inbound Orders" },
    { id: MAIN_TABS.WASTE_DISPOSAL, status: "Pending", subService: null },
    { id: "LAUNCH_HIRE", status: "In Progress", subService: null },
  ] : []);
  const cardColor = "#00368c"; // Fixed color for all buttons, effects, and backgrounds


  const handleServiceSelect = useCallback((tab) => {
    setServiceSelected(true);
    setSelectedActionTab(null); // Reset selected action

    // Add or update booked service
    setBookedServices(prev => {
      const existing = prev.find(bs => bs.id === tab);
      if (existing) {
        // Service already booked, update it
        return prev.map(bs => bs.id === tab ? { ...bs, status: bs.status || "Pending" } : bs);
      } else {
        // New service booking
        const newService = {
          id: tab,
          status: "Pending",
          subService: null,
        };
        return [...prev, newService];
      }
    });

    // Handle "LAUNCH_HIRE" selection - behaves like Crew Management but with Launch Hire only
    if (tab === "LAUNCH_HIRE") {
      setSelectedServices([MAIN_TABS.CREW_MANAGEMENT]);
      setActiveMainTab(MAIN_TABS.CREW_MANAGEMENT);
      setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
      setIsLaunchHireMode(true);
    } else {
      // Single service selection
      setIsLaunchHireMode(false);
      setSelectedServices([tab]);
      setActiveMainTab(tab);
      // Reset to default sub-tab when service is selected
      if (tab === MAIN_TABS.CREW_MANAGEMENT) {
        setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
      } else if (tab === MAIN_TABS.MATERIAL_MANAGEMENT) {
        setActiveSubTab(MATERIAL_MANAGEMENT_SUBTABS.INBOUND_ORDERS);
      } else if (tab === MAIN_TABS.WASTE_DISPOSAL) {
        // Waste Disposal - no subtabs, direct to content
        setActiveSubTab(null);
      } else if (tab === MAIN_TABS.ON_STATION) {
        // On station - placeholder for future implementation
        setActiveSubTab(null);
      } else if (tab === MAIN_TABS.MWP_RENEWAL) {
        // MWP Renewal - placeholder for future implementation
        setActiveSubTab(null);
      } else if (tab === MAIN_TABS.THIRD_PARTY_SERVICES) {
        // Third-Party Services - placeholder for future implementation
        setActiveSubTab(null);
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
      setActiveSubTab(MATERIAL_MANAGEMENT_SUBTABS.INBOUND_ORDERS);
    } else if (tab === MAIN_TABS.ON_STATION ||
      tab === MAIN_TABS.WASTE_DISPOSAL) {
      // These services have no subtabs
      setActiveSubTab(null);
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

      // Update booked service with sub-service info
      if (activeMainTab) {
        setBookedServices(prev => {
          const service = prev.find(bs => bs.id === activeMainTab);
          if (service) {
            const subServiceLabels = {
              [CREW_MANAGEMENT_SUBTABS.TRANSPORT]: "Transport",
              [CREW_MANAGEMENT_SUBTABS.CG_PASS]: "CG Pass",
              [CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS]: "Zawil Pass",
              [CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE]: "Launch Hire",
              [CREW_MANAGEMENT_SUBTABS.HOTEL]: "Hotel",
              [CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE]: "Medical Service",
              [MATERIAL_MANAGEMENT_SUBTABS.INBOUND_ORDERS]: "Inbound Orders",
              [MATERIAL_MANAGEMENT_SUBTABS.LANDING_NOTE]: "Landing Note",
              [MATERIAL_MANAGEMENT_SUBTABS.DISPATCH_NOTE]: "Dispatch Note",
            };

            return prev.map(bs =>
              bs.id === activeMainTab
                ? { ...bs, subService: subServiceLabels[tab] || null }
                : bs
            );
          }
          return prev;
        });
      }
    }
  }, [activeMainTab]);

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

      // Update booked service with sub-service info
      setBookedServices(prev => {
        const service = prev.find(bs => bs.id === MAIN_TABS.CREW_MANAGEMENT);
        if (service) {
          const subServiceLabels = {
            [CREW_MANAGEMENT_SUBTABS.TRANSPORT]: "Transport",
            [CREW_MANAGEMENT_SUBTABS.CG_PASS]: "CG Pass",
            [CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS]: "Zawil Pass",
            [CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE]: "Launch Hire",
            [CREW_MANAGEMENT_SUBTABS.HOTEL]: "Hotel",
            [CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE]: "Medical Service",
          };

          return prev.map(bs =>
            bs.id === MAIN_TABS.CREW_MANAGEMENT
              ? { ...bs, subService: subServiceLabels[targetTab] || null }
              : bs
          );
        }
        return prev;
      });
    }
  }, [activeMainTab]);

  const handleBackToServiceSelection = useCallback(() => {
    setServiceSelected(false);
    setSelectedServices([]);
    setActiveMainTab(null);
    setActiveSubTab(CREW_MANAGEMENT_SUBTABS.CREW);
    setSelectedActionTab(null);
    setIsLaunchHireMode(false);
    // Keep booked services when going back
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
            launchHireOnly={isLaunchHireMode}
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
            launchHireOnly={isLaunchHireMode}
          />
        );
    }
  };

  const renderMaterialManagementContent = () => {
    switch (activeSubTab) {
      case MATERIAL_MANAGEMENT_SUBTABS.INBOUND_ORDERS:
        return (
          <InboundOrdersContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case MATERIAL_MANAGEMENT_SUBTABS.LANDING_NOTE:
        return (
          <LandingNoteContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      case MATERIAL_MANAGEMENT_SUBTABS.DISPATCH_NOTE:
        return (
          <DispatchNoteContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
      default:
        return (
          <InboundOrdersContent
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        );
    }
  };

  // DA module Husbandry: crew table only (no Booked Services)
  if (isDAModule) {
    return (
      <div className="operation-wrapper husbandry-wrapper" style={{ "--card-color": cardColor }}>
        <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
          <div className="husbandry-service-selection-content">
            <div className="husbandry-da-crew-table-wrapper">
              <table className="table husbandry-da-crew-table">
                <thead>
                  <tr>
                    <th>Crew Name</th>
                    <th>Nationality</th>
                    <th>Rank</th>
                    <th>Passport No.</th>
                    <th>Iqama No.</th>
                    <th>Visa No.</th>
                    <th>Services</th>
                  </tr>
                </thead>
                <tbody>
                  {DAMODULE_CREW_DUMMY.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.crewName}</td>
                      <td>{row.nationality}</td>
                      <td>{row.rank}</td>
                      <td>{row.passportNo}</td>
                      <td>{row.iqamaNo}</td>
                      <td>{row.visaNo}</td>
                      <td>
                        <span className="husbandry-da-crew-service-badge">{row.service ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show service selection if no service has been selected (normal mode)
  if (!serviceSelected) {
    return (
      <div className="operation-wrapper husbandry-wrapper" style={{ "--card-color": cardColor }}>
        <ServiceSelection
          onSelectService={handleServiceSelect}
          cardColor={cardColor}
          bookedServices={bookedServices}
        />
      </div>
    );
  }

  return (
    <div className="operation-wrapper husbandry-wrapper" style={{ "--card-color": cardColor }}>
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
          {activeMainTab === MAIN_TABS.WASTE_DISPOSAL && (
            <WasteDisposalContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
            />
          )}
          {activeMainTab === MAIN_TABS.ON_STATION && (
            <OnStationContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
            />
          )}
          {activeMainTab === MAIN_TABS.MWP_RENEWAL && (
            <MWPRenewalContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
            />
          )}
          {activeMainTab === MAIN_TABS.THIRD_PARTY_SERVICES && (
            <ThirdPartyServicesContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Husbandry.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isDAModule: PropTypes.bool,
};

export default Husbandry;

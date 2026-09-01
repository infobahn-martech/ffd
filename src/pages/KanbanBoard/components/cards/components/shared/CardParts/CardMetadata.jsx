import PropTypes from "prop-types";
import { FiBriefcase, FiAnchor, FiLayers, FiAlertTriangle } from "react-icons/fi";
import { resolveIconComponentStrict } from "../../../../../../../structure/SideNav/components/DynamicIcon";
import { hasText, isValidImage } from "../../../../../utils/cardDisplayHelpers";

const CarIcon = ({ size = 13, color = "var(--ffd-navy)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const HotelIcon = ({ size = 13, color = "var(--ffd-navy)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const MedicalIcon = ({ size = 13, color = "var(--ffd-navy)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const MaterialManagementIcon = ({ size = 13, color = "var(--ffd-navy)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const WasteDisposalIcon = ({ size = 13, color = "var(--ffd-navy)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function CountBadge({ IconComp, count, label }) {
  const value = Number(count);
  if (!Number.isFinite(value) || value <= 0) return null;
  return (
    <span className="card-count-badge" title={label}>
      <IconComp />
      <span>{value}</span>
    </span>
  );
}
CountBadge.propTypes = {
  IconComp: PropTypes.elementType.isRequired,
  count: PropTypes.number,
  label: PropTypes.string.isRequired,
};

/**
 * Conditional supporting-information block below the title. Every row is
 * independently gated on real data — nothing renders when its field is
 * absent, so there are never empty rows.
 */
function CardMetadata({ card, isClassicLayout }) {
  const taskName = hasText(card.taskName) ? String(card.taskName).trim() : "";
  const client = hasText(card.billingEntity)
    ? card.billingEntity
    : hasText(card.name)
      ? card.name
      : "";
  const vessel = hasText(card.vesselName) && card.vesselName !== client ? card.vesselName : "";
  const showLogo = isValidImage(card.entityLogo);
  const StickerIcon = resolveIconComponentStrict(card.stickerIcon);
  const BlockerIcon = resolveIconComponentStrict(card.blockerIcon);
  const hasCounts =
    Number(card.transportCount) > 0 ||
    Number(card.hotelCount) > 0 ||
    Number(card.medicalCount) > 0 ||
    Number(card.materialManagementCount) > 0 ||
    Number(card.wasteDisposalCount) > 0;
  const port = isClassicLayout && hasText(card.port) ? card.port : "";

  const hasAnyRow = taskName || client || vessel || StickerIcon || BlockerIcon || hasCounts || port;
  if (!hasAnyRow) return null;

  return (
    <div className="card-metadata">
      {taskName && (
        <div className="card-metadata-row" title={taskName}>
          <FiLayers size={12} className="card-metadata-icon" />
          <span className="card-metadata-text">{taskName}</span>
        </div>
      )}
      {client && (
        <div className="card-metadata-row" title={client}>
          {showLogo ? (
            <img src={card.entityLogo} alt="" className="card-metadata-logo" loading="lazy" />
          ) : (
            <FiBriefcase size={12} className="card-metadata-icon" />
          )}
          <span className="card-metadata-text">{client}</span>
        </div>
      )}
      {vessel && (
        <div className="card-metadata-row" title={vessel}>
          <FiAnchor size={12} className="card-metadata-icon" />
          <span className="card-metadata-text">{vessel}</span>
        </div>
      )}
      {BlockerIcon && (
        <div className="card-metadata-row card-metadata-row--warning" title={card.blockerName}>
          <FiAlertTriangle size={12} className="card-metadata-icon card-metadata-icon--warning" style={{ color: card.blockerColor || "var(--color-danger)" }} />
          <span className="card-metadata-text">{card.blockerName || "Blocked"}</span>
        </div>
      )}
      {(StickerIcon || hasCounts || port) && (
        <div className="card-metadata-chips-row">
          {StickerIcon && (
            <span
              className="card-metadata-sticker-chip"
              title={card.stickerName}
              style={{ backgroundColor: card.stickerColor || "var(--ffd-navy)" }}
            >
              <StickerIcon size={11} color="#fff" />
            </span>
          )}
          {hasCounts && (
            <>
              <CountBadge IconComp={CarIcon} count={card.transportCount} label="Transport" />
              <CountBadge IconComp={HotelIcon} count={card.hotelCount} label="Hotel" />
              <CountBadge IconComp={MedicalIcon} count={card.medicalCount} label="Medical" />
              <CountBadge IconComp={MaterialManagementIcon} count={card.materialManagementCount} label="Material Management" />
              <CountBadge IconComp={WasteDisposalIcon} count={card.wasteDisposalCount} label="Waste Disposal" />
            </>
          )}
          {port && (
            <span className="card-metadata-chip" title="Port">
              {port}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

CardMetadata.propTypes = {
  card: PropTypes.shape({
    taskName: PropTypes.string,
    billingEntity: PropTypes.string,
    name: PropTypes.string,
    vesselName: PropTypes.string,
    entityLogo: PropTypes.string,
    stickerIcon: PropTypes.string,
    stickerColor: PropTypes.string,
    stickerName: PropTypes.string,
    blockerIcon: PropTypes.string,
    blockerColor: PropTypes.string,
    blockerName: PropTypes.string,
    transportCount: PropTypes.number,
    hotelCount: PropTypes.number,
    medicalCount: PropTypes.number,
    materialManagementCount: PropTypes.number,
    wasteDisposalCount: PropTypes.number,
    port: PropTypes.string,
  }).isRequired,
  isClassicLayout: PropTypes.bool,
};

export default CardMetadata;

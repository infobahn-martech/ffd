import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "../../../../../../design/css/components/CardItem.css";
import { FiMoreHorizontal } from "react-icons/fi";
import { resolveIconComponentStrict } from "../../../../../../structure/SideNav/components/DynamicIcon";
import {
  hasText,
  isValidProgress,
  isValidImage,
  getApiCardDisplayTitle,
  getApiCardTaskName,
  getUsernameInitial,
} from "../../../../utils/cardDisplayHelpers";

/** Top-left badge: dynamic Fi/Lu icon from API `cardTypeIcon` (e.g. LuRocket). */
function ApiCardTypeIcon({ card }) {
  const IconComponent = resolveIconComponentStrict(card.cardTypeIcon);

  if (!IconComponent) return null;

  return (
    <div
      className="card-type-icon-badge"
      title={card.cardTypeName}
      style={{
        backgroundColor: card.cardTypeColor || "#2563eb",
      }}
    >
      <IconComponent size={12} />
    </div>
  );
}

ApiCardTypeIcon.propTypes = {
  card: PropTypes.shape({
    cardTypeIcon: PropTypes.string,
    cardTypeColor: PropTypes.string,
    cardTypeName: PropTypes.string,
  }).isRequired,
};

/** Badge overlapping the user-avatar's corner: dynamic Fi/Lu icon from API `blockerIcon`. */
function ApiCardBlockerBadge({ card }) {
  const IconComponent = resolveIconComponentStrict(card.blockerIcon);

  if (!IconComponent) return null;

  return (
    <span
      className="card-api-blocker-badge"
      title={card.blockerName}
      style={{
        backgroundColor: card.blockerColor || "#dc3545",
      }}
      aria-hidden
    >
      <IconComponent size={10} color="#fff" />
    </span>
  );
}

ApiCardBlockerBadge.propTypes = {
  card: PropTypes.shape({
    blockerIcon: PropTypes.string,
    blockerColor: PropTypes.string,
    blockerName: PropTypes.string,
  }).isRequired,
};

/** Centered row below the entity logo: dynamic Fi/Lu icon from API `stickerIcon`. */
function ApiCardStickerBadge({ card }) {
  const IconComponent = resolveIconComponentStrict(card.stickerIcon);

  if (!IconComponent) return null;

  return (
    <div className="card-api-sticker-row" title={card.stickerName}>
      <span
        className="card-api-sticker-badge"
        style={{ backgroundColor: card.stickerColor || "#2563eb" }}
        aria-hidden
      >
        <IconComponent size={14} color="#fff" />
      </span>
    </div>
  );
}

ApiCardStickerBadge.propTypes = {
  card: PropTypes.shape({
    stickerIcon: PropTypes.string,
    stickerColor: PropTypes.string,
    stickerName: PropTypes.string,
  }).isRequired,
};

/** Single service-count badge: icon + count. Hidden when count is 0/empty. */
function ApiCardCountBadge({ IconComp, count, label }) {
  const value = Number(count);
  if (!Number.isFinite(value) || value <= 0) return null;
  return (
    <span className="card-api-count-badge" title={label}>
      <IconComp size={13} color="#2563eb" />
      <span>{value}</span>
    </span>
  );
}

ApiCardCountBadge.propTypes = {
  IconComp: PropTypes.elementType.isRequired,
  count: PropTypes.number,
  label: PropTypes.string.isRequired,
};

/** Row of API service-count icons (transport/hotel/medical/material/waste) shown on full API cards. */
function ApiCardCountIconsRow({ card }) {
  const hasAny =
    Number(card.transportCount) > 0 ||
    Number(card.hotelCount) > 0 ||
    Number(card.medicalCount) > 0 ||
    Number(card.materialManagementCount) > 0 ||
    Number(card.wasteDisposalCount) > 0;
  if (!hasAny) return null;

  return (
    <div className="card-api-count-icons-row">
      <ApiCardCountBadge IconComp={CarIcon} count={card.transportCount} label="Transport" />
      <ApiCardCountBadge IconComp={HotelIcon} count={card.hotelCount} label="Hotel" />
      <ApiCardCountBadge IconComp={MedicalIcon} count={card.medicalCount} label="Medical" />
      <ApiCardCountBadge IconComp={MaterialManagementIcon} count={card.materialManagementCount} label="Material Management" />
      <ApiCardCountBadge IconComp={WasteDisposalIcon} count={card.wasteDisposalCount} label="Waste Disposal" />
    </div>
  );
}

ApiCardCountIconsRow.propTypes = {
  card: PropTypes.shape({
    transportCount: PropTypes.number,
    hotelCount: PropTypes.number,
    medicalCount: PropTypes.number,
    materialManagementCount: PropTypes.number,
    wasteDisposalCount: PropTypes.number,
  }).isRequired,
};

/** Circular KPI used in API card summary row (classic + compact). */
function ApiCardCircularKpi({ progress }) {
  const pct = Math.min(100, Math.max(0, Number(progress)));
  return (
    <div className="card-api-kpi">
      <div className="circular-progress">
        <svg className="progress-svg" viewBox="0 0 26 26" aria-hidden>
          <circle className="bg" cx="13" cy="13" r="11.5" />
          <circle
            className="progress"
            cx="13"
            cy="13"
            r="11.5"
            style={{
              stroke: "#0d9488",
              strokeDashoffset: `calc(72 - (72 * ${pct}) / 100)`,
            }}
          />
        </svg>
        <div className="progress-text">{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

// Icon components
const CarIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const HotelIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const MedicalIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);


const MaterialManagementIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const WasteDisposalIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ApiCardTaskLine({ card }) {
  const taskName = getApiCardTaskName(card);
  if (!hasText(taskName)) return null;
  return (
    <p className="card-api-task-name" title={taskName}>
      {taskName}
    </p>
  );
}

/** API-driven board cards: only fields from backend, no mock footer / extra icon rows. */
function ApiKanbanCardShrunk({ card, setSelectedCard }) {
  const displayTitle = getApiCardDisplayTitle(card);
  const usernameInitial = getUsernameInitial(card.user);
  const hasTimeline = hasText(card.timeLeft);
  const hasProgress = isValidProgress(card.progress);
  const showSummaryRow = hasTimeline || hasProgress;

  return (
    <div className="card-content-compact card-content-compact--api">
      <div className="card-api-title-row card-api-title-row--compact">
        <div
          className="card-title-compact card-title-compact--api card-api-title-text"
          onClick={() => setSelectedCard(card)}
          title={displayTitle || undefined}
        >
          {displayTitle}
        </div>
        {usernameInitial ? (
          <span className="card-api-avatar-wrap">
            <span className="card-api-user-avatar" title={hasText(card.user) ? String(card.user).trim() : undefined} aria-hidden>
              {usernameInitial}
            </span>
            <ApiCardBlockerBadge card={card} />
          </span>
        ) : null}
      </div>
      <ApiCardTaskLine card={card} />
      {showSummaryRow ? (
        <div className="card-api-summary-row card-api-summary-row--compact">
          <div className="card-api-summary-left">
            {hasTimeline ? <span className="card-api-timeline">{card.timeLeft}</span> : null}
          </div>
          <div className="card-api-summary-right">
            {hasProgress ? <ApiCardCircularKpi progress={card.progress} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ApiKanbanCardFull({
  card,
  setSelectedCard,
  isModernLayout,
  isClassicLayout,
}) {
  const displayTitle = getApiCardDisplayTitle(card);
  const secondary = hasText(card.billingEntity)
    ? card.billingEntity
    : hasText(card.name)
      ? card.name
      : "";
  const showLogo = isValidImage(card.entityLogo);
  const usernameInitial = getUsernameInitial(card.user);
  const hasTimeline = hasText(card.timeLeft);
  const hasProgress = isValidProgress(card.progress);
  const showSummaryRow = hasTimeline || hasProgress;

  const showHeaderRow = isModernLayout || showLogo;

  return (
    <>
      {showHeaderRow && (
        <div
          className={`card-api-header ${isModernLayout ? "card-api-header--modern" : ""}`}
        >
          {isModernLayout ? (
            <>
              {showLogo && (
                <img
                  src={card.entityLogo}
                  alt=""
                  className="card-api-logo"
                  loading="lazy"
                />
              )}
              <button
                type="button"
                className="card-action-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCard(card);
                }}
                aria-label="Actions"
              >
                <FiMoreHorizontal size={18} />
              </button>
            </>
          ) : (
            showLogo && (
              <img
                src={card.entityLogo}
                alt=""
                className="card-api-logo"
                loading="lazy"
              />
            )
          )}
        </div>
      )}

      <ApiCardStickerBadge card={card} />

      <div className="card-title-row card-title-row--api">
        <div className="card-api-title-row">
          <h3
            className={`card-title card-title--api card-api-title-text ${isModernLayout ? "card-title-modern" : ""}`}
            onClick={() => setSelectedCard(card)}
            title={displayTitle || undefined}
          >
            {displayTitle}
          </h3>
          {usernameInitial ? (
            <span className="card-api-avatar-wrap">
              <span
                className="card-api-user-avatar"
                title={hasText(card.user) ? String(card.user).trim() : undefined}
                aria-hidden
              >
                {usernameInitial}
              </span>
              <ApiCardBlockerBadge card={card} />
            </span>
          ) : null}
        </div>
        <ApiCardTaskLine card={card} />
        {hasText(secondary) ? (
          <p className="card-api-secondary" title={secondary}>
            {secondary}
          </p>
        ) : null}
      </div>

      <ApiCardCountIconsRow card={card} />

      {showSummaryRow ? (
        <div className="card-api-summary-row">
          <div className="card-api-summary-left">
            {hasTimeline ? <span className="card-api-timeline">{card.timeLeft}</span> : null}
          </div>
          <div className="card-api-summary-right">
            {hasProgress ? <ApiCardCircularKpi progress={card.progress} /> : null}
          </div>
        </div>
      ) : null}

      {isClassicLayout && hasText(card.port) && (
        <div className="card-mini-tags card-mini-tags--api">
          <span className="card-mini-tag card-mini-tag-port" title="Port">
            {card.port}
          </span>
        </div>
      )}
    </>
  );
}

function CardItem({
  card,
  index,
  setSelectedCard,
  isShrunk = false,
  isClassicLayout = false,
  isModernLayout = false,
  isDarkMode = false,
  fixedDimensions = null,
}) {
  const cardColor = card.color || "#2A00FF";

  const fixedBoardSizeStyle =
    fixedDimensions != null
      ? (() => {
        const w = fixedDimensions.width;
        const base = {
          width: w,
          minWidth: w,
          maxWidth: w,
          boxSizing: "border-box",
        };
        if (fixedDimensions.height != null) {
          return {
            ...base,
            height: fixedDimensions.height,
            minHeight: fixedDimensions.height,
            maxHeight: fixedDimensions.height,
            overflow: "hidden",
          };
        }
        return base;
      })()
      : null;

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={KANBAN_DND_DISABLED}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card kanban-card--api ${snapshot.isDragging ? "dragging" : ""} ${card.priority ? "priority-blink" : ""} ${isShrunk ? "card-shrunk" : ""} ${isClassicLayout ? "kanban-card-classic" : ""} ${isModernLayout ? "kanban-card-modern" : ""} ${isDarkMode ? "kanban-card-dark" : ""} ${fixedBoardSizeStyle ? "kanban-card--fixed-board" : ""}`}
          ref={provided.innerRef}
          {...(KANBAN_DND_DISABLED ? {} : provided.draggableProps)}
          {...(KANBAN_DND_DISABLED ? {} : provided.dragHandleProps)}
          style={{
            ...fixedBoardSizeStyle,
            ...(KANBAN_DND_DISABLED ? {} : provided.draggableProps.style),
            "--card-color": cardColor,
          }}
        >
          {card.cardTypeIcon && (
            <ApiCardTypeIcon card={card} />
          )}
          {isShrunk ? (
            <ApiKanbanCardShrunk card={card} setSelectedCard={setSelectedCard} />
          ) : (
            <ApiKanbanCardFull
              card={card}
              setSelectedCard={setSelectedCard}
              isModernLayout={isModernLayout}
              isClassicLayout={isClassicLayout}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}

CardItem.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    cardSource: PropTypes.oneOf(["api", "static"]),
    cardTypeIcon: PropTypes.string,
    cardTypeColor: PropTypes.string,
    cardTypeName: PropTypes.string,
    title: PropTypes.string,
    cardName: PropTypes.string,
    name: PropTypes.string,
    user: PropTypes.string,
    entityLogo: PropTypes.string,
    color: PropTypes.string,
    iconType: PropTypes.string,
    timeLeft: PropTypes.string,
    progress: PropTypes.number,
    priority: PropTypes.bool,
    taskName: PropTypes.string,
    taskId: PropTypes.string,
    transport: PropTypes.string,
    transportCount: PropTypes.number, // API cards: see ApiCardCountIconsRow
    hotel: PropTypes.string,
    hotelCount: PropTypes.number,
    medicalService: PropTypes.string,
    medicalServiceCount: PropTypes.number,
    medicalCount: PropTypes.number, // API cards: medical_count
    onStation: PropTypes.string,
    onStationCount: PropTypes.number,
    materialManagement: PropTypes.string,
    materialManagementCount: PropTypes.number,
    wasteDisposal: PropTypes.string,
    wasteDisposalCount: PropTypes.number,
    launchHire: PropTypes.string,
    launchHireCount: PropTypes.number,
    blockerIcon: PropTypes.string,
    blockerColor: PropTypes.string,
    blockerName: PropTypes.string,
    stickerIcon: PropTypes.string,
    stickerColor: PropTypes.string,
    stickerName: PropTypes.string,
    footerShowIcons: PropTypes.arrayOf(PropTypes.string),
    footerSubtasks: PropTypes.number,
    footerDeadline: PropTypes.string,
    footerWatchers: PropTypes.number,
    footerLinkCount: PropTypes.number,
    footerEta: PropTypes.string,
    extraDetailsShowIcons: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isShrunk: PropTypes.bool,
  isClassicLayout: PropTypes.bool,
  isModernLayout: PropTypes.bool,
  isDarkMode: PropTypes.bool,
  fixedDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number,
  }),
};

export default CardItem;

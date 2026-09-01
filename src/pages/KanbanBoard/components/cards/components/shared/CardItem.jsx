import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import "../../../../../../design/css/components/CardItem.css";
import {
  hasText,
  isValidProgress,
  getApiCardDisplayTitle,
  getApiCardTaskName,
  getUsernameInitial,
} from "../../../../utils/cardDisplayHelpers";
import { CardHeader, CardMetadata, CardFooter } from "./CardParts";

/** API-driven board cards, compact/shrunk layout: title + due/progress summary only. */
function ApiKanbanCardShrunk({ card, setSelectedCard }) {
  const displayTitle = getApiCardDisplayTitle(card);
  const taskName = getApiCardTaskName(card);
  const usernameInitial = getUsernameInitial(card.user);

  return (
    <>
      <CardHeader card={card} setSelectedCard={setSelectedCard} isModernLayout={false} />
      <div
        className="card-title card-title--api"
        onClick={() => setSelectedCard(card)}
        title={displayTitle || undefined}
      >
        {displayTitle}
      </div>
      {hasText(taskName) && <p className="card-api-task-name">{taskName}</p>}
      <CardFooter
        timeLeft={card.timeLeft}
        assigneeInitial={usernameInitial}
        assigneeName={card.user}
        progress={isValidProgress(card.progress) ? card.progress : undefined}
      />
    </>
  );
}

ApiKanbanCardShrunk.propTypes = {
  card: PropTypes.object.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
};

/** API-driven board cards, full layout: header, 2-line title, metadata, footer. */
function ApiKanbanCardFull({ card, setSelectedCard, isModernLayout, isClassicLayout }) {
  const displayTitle = getApiCardDisplayTitle(card);
  const usernameInitial = getUsernameInitial(card.user);

  return (
    <>
      <CardHeader card={card} setSelectedCard={setSelectedCard} isModernLayout={isModernLayout} />

      <h3
        className="card-title card-title--api"
        onClick={() => setSelectedCard(card)}
        title={displayTitle || undefined}
      >
        {displayTitle}
      </h3>

      <CardMetadata card={card} isClassicLayout={isClassicLayout} />

      <CardFooter
        timeLeft={card.timeLeft}
        assigneeInitial={usernameInitial}
        assigneeName={card.user}
        progress={isValidProgress(card.progress) ? card.progress : undefined}
      />
    </>
  );
}

ApiKanbanCardFull.propTypes = {
  card: PropTypes.object.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isModernLayout: PropTypes.bool,
  isClassicLayout: PropTypes.bool,
};

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
  const cardColor = card.color || "var(--ffd-navy)";

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
          className={`kanban-card kanban-card--api ${snapshot.isDragging ? "dragging" : ""} ${isShrunk ? "card-shrunk" : ""} ${isClassicLayout ? "kanban-card-classic" : ""} ${isModernLayout ? "kanban-card-modern" : ""} ${isDarkMode ? "kanban-card-dark" : ""} ${fixedBoardSizeStyle ? "kanban-card--fixed-board" : ""}`}
          ref={provided.innerRef}
          {...(KANBAN_DND_DISABLED ? {} : provided.draggableProps)}
          {...(KANBAN_DND_DISABLED ? {} : provided.dragHandleProps)}
          style={{
            ...fixedBoardSizeStyle,
            ...(KANBAN_DND_DISABLED ? {} : provided.draggableProps.style),
            "--card-color": cardColor,
          }}
        >
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
    transportCount: PropTypes.number, // API cards: see CardMetadata
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

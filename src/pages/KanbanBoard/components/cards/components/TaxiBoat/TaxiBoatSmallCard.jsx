import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-small-card.scss";

const SERVICE_THEME = {
  "Crew Change":                        { bar: "#2666be", badge: "#dbeafe", badgeColor: "#1d4ed8" },
  "Technician Visit":                   { bar: "#0284c7", badge: "#e0f2fe", badgeColor: "#0369a1" },
  "Port Captain & Port Engineer Visit": { bar: "#7c3aed", badge: "#ede9fe", badgeColor: "#6d28d9" },
  "Aramco Personnel":                   { bar: "#b45309", badge: "#fef3c7", badgeColor: "#92400e" },
  "Immigration Clearance":              { bar: "#7c3aed", badge: "#ede9fe", badgeColor: "#6d28d9" },
  "Material Delivery":                  { bar: "#16a34a", badge: "#dcfce7", badgeColor: "#15803d" },
  "Provision Delivery":                 { bar: "#16a34a", badge: "#dcfce7", badgeColor: "#15803d" },
  "Garbage Collection":                 { bar: "#16a34a", badge: "#dcfce7", badgeColor: "#15803d" },
  "Custom Inspection":                  { bar: "#d97706", badge: "#fef3c7", badgeColor: "#b45309" },
  "Tanker Clearance":                   { bar: "#0f766e", badge: "#ccfbf1", badgeColor: "#0f766e" },
};

const DEFAULT_THEME = { bar: "#64748b", badge: "#f1f5f9", badgeColor: "#475569" };

export default function TaxiBoatSmallCard({ card, index, setSelectedCard }) {
  const serviceType = card?.typeOfService ?? "";
  const theme       = SERVICE_THEME[serviceType] ?? DEFAULT_THEME;
  const vesselName  = card?.vesselName || card?.title || "—";
  const custName    = card?.name || "";
  const userName    = card?.user || "";
  const timeLeft    = card?.timeLeft || "";
  const progress    = card?.progress ?? 0;
  const userInitial = userName.charAt(0).toUpperCase();
  const custInitial = custName.charAt(0).toUpperCase();

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={KANBAN_DND_DISABLED}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="tb-sc"
          style={{ "--tb-bar": theme.bar, ...provided.draggableProps.style }}
          onClick={() => setSelectedCard(card)}
        >
          {/* User avatar — top right */}
          {userName && (
            <div className="tb-sc-avatar" style={{ background: theme.bar }}>
              {userInitial}
            </div>
          )}

          {/* Vessel name + customer initial badge */}
          <div className="tb-sc-title-row">
            <span className="tb-sc-vessel">{vesselName}</span>
            {custInitial && (
              <span
                className="tb-sc-client-badge"
                style={{ color: theme.badgeColor, background: theme.badge }}
              >
                {custInitial}
              </span>
            )}
          </div>

          {/* Service type */}
          {serviceType && (
            <div className="tb-sc-service" style={{ color: theme.bar }}>
              {serviceType}
            </div>
          )}

          {/* Customer name */}
          {custName && <div className="tb-sc-customer">{custName}</div>}

          {/* Footer: time + progress */}
          <div className="tb-sc-footer">
            {timeLeft && <span className="tb-sc-time">{timeLeft}</span>}
            <span className="tb-sc-progress">{progress}%</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

TaxiBoatSmallCard.propTypes = {
  card: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
};

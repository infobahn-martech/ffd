import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-small-card.scss";

const SERVICE_BADGE_COLOR = {
  "Crew Change":                        { bg: "#dbeafe", color: "#1d4ed8" },
  "Technician Visit":                   { bg: "#e0f2fe", color: "#0369a1" },
  "Port Captain & Port Engineer Visit": { bg: "#ede9fe", color: "#6d28d9" },
  "Aramco Personnel":                   { bg: "#fef3c7", color: "#92400e" },
  "Immigration Clearance":              { bg: "#ede9fe", color: "#6d28d9" },
  "Material Delivery":                  { bg: "#dcfce7", color: "#15803d" },
  "Provision Delivery":                 { bg: "#dcfce7", color: "#15803d" },
  "Garbage Collection":                 { bg: "#dcfce7", color: "#15803d" },
  "Custom Inspection":                  { bg: "#fef3c7", color: "#b45309" },
  "Tanker Clearance":                   { bg: "#ccfbf1", color: "#0f766e" },
};

const DEFAULT_BADGE = { bg: "#f1f5f9", color: "#475569" };

// Consistent avatar color derived from company name (not service-themed)
function avatarColor(name = "") {
  const palette = ["#16a34a", "#0284c7", "#7c3aed", "#b45309", "#0f766e", "#2666be", "#dc2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function TaxiBoatSmallCard({ card, index, setSelectedCard }) {
  const serviceType  = card?.typeOfService ?? "";
  const badge        = SERVICE_BADGE_COLOR[serviceType] ?? DEFAULT_BADGE;
  const vesselName   = card?.vesselName || card?.title || "—";
  const custName     = card?.name || "";
  const timeLeft     = card?.timeLeft || "";
  const progress     = card?.progress ?? 0;
  const custInitial  = custName.charAt(0).toUpperCase();
  const svcInitial   = serviceType.charAt(0).toUpperCase();
  const avatarBg     = avatarColor(custName);

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={KANBAN_DND_DISABLED}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="tb-sc"
          style={provided.draggableProps.style}
          onClick={() => setSelectedCard(card)}
        >
          {/* Company avatar — top right */}
          <div className="tb-sc-avatar" style={{ background: avatarBg }}>
            {custInitial}
          </div>

          {/* Vessel name + service initial badge */}
          <div className="tb-sc-title-row">
            <span className="tb-sc-vessel">{vesselName}</span>
            {svcInitial && (
              <span
                className="tb-sc-svc-badge"
                style={{ color: badge.color, background: badge.bg }}
              >
                {svcInitial}
              </span>
            )}
          </div>

          {/* Customer name — teal */}
          {custName && <div className="tb-sc-customer">{custName}</div>}

          {/* Service type — gray */}
          {serviceType && <div className="tb-sc-service">{serviceType}</div>}

          {/* Footer: time + circular progress */}
          <div className="tb-sc-footer">
            {timeLeft && <span className="tb-sc-time">{timeLeft}</span>}
            <div className="tb-sc-progress-wrap">
              <svg className="tb-sc-svg" viewBox="0 0 26 26">
                <circle className="tb-sc-svg-bg" cx="13" cy="13" r="11" />
                <circle
                  className="tb-sc-svg-fill"
                  cx="13"
                  cy="13"
                  r="11"
                  style={{ strokeDashoffset: `calc(69 - (69 * ${progress}) / 100)` }}
                />
              </svg>
              <span className="tb-sc-progress-text">{progress}%</span>
            </div>
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

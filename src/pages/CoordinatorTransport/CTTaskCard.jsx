import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import "../../design/scss/pages/coordinator-transport/ct-task-card.scss";
import saudimarcapLogo from "../../assets/images/saudimarcap.png";
import saipemLogo      from "../../assets/images/saipem.png";
import lamprellLogo    from "../../assets/images/lamprell.png";
import gulfmarineLogo  from "../../assets/images/gulfmarine.png";

const COMPANY_LOGO_MAP = {
  "gulf marine":  gulfmarineLogo,
  "gulfmarine":   gulfmarineLogo,
  "saudi marcap": saudimarcapLogo,
  "saudimarcap":  saudimarcapLogo,
  "snamprogetti": saipemLogo,
  "saipem":       saipemLogo,
  "lamprell":     lamprellLogo,
};

function getCompanyLogo(name, entityLogo) {
  if (entityLogo) return entityLogo;
  if (!name) return null;
  return COMPANY_LOGO_MAP[name.toLowerCase().trim()] ?? null;
}

function avatarColor(name = "") {
  const palette = ["#16a34a", "#0284c7", "#7c3aed", "#b45309", "#0f766e", "#2666be", "#dc2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function CTTaskCard({ card, index, setSelectedCard, isSelected, onToggleSelect, isSelectionMode }) {
  const serviceType = card?.typeOfService ?? "";
  const vesselName  = card?.vesselName || card?.title || "—";
  const custName    = card?.name || "";
  const timeLeft    = card?.timeLeft || "";
  const progress    = card?.progress ?? 0;
  const custInitial = custName.charAt(0).toUpperCase();
  const svcInitial  = serviceType.charAt(0).toUpperCase();
  const logoSrc     = getCompanyLogo(custName, card?.entityLogo);
  const avatarBg    = avatarColor(custName);

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelect(card.id);
    } else {
      setSelectedCard(card);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={KANBAN_DND_DISABLED}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            "tb-sc",
            "ct-tc",
            isSelected      ? "ct-tc--selected"   : "",
            isSelectionMode ? "ct-tc--selectable"  : "",
          ].filter(Boolean).join(" ")}
          style={{ ...provided.draggableProps.style, "--ct-avatar-bg": avatarBg, "--ct-progress": progress }}
          onClick={handleClick}
        >
          {isSelectionMode && (
            <div
              className="ct-tc-select-overlay"
              onClick={(e) => { e.stopPropagation(); onToggleSelect(card.id); }}
            >
              <span className={`ct-tc-check-box${isSelected ? " ct-tc-check-box--checked" : ""}`}>
                {isSelected && "✓"}
              </span>
            </div>
          )}

          <div className="tb-sc-top">
            <div className="tb-sc-accent-line" />
            {logoSrc ? (
              <img src={logoSrc} alt={custName} className="tb-sc-avatar-img" />
            ) : (
              <div className="tb-sc-avatar ct-tc-avatar">
                {custInitial}
              </div>
            )}
          </div>

          <div className="tb-sc-content">
            <div className="tb-sc-title-row">
              <span className="tb-sc-vessel">{vesselName}</span>
              {svcInitial && <span className="tb-sc-svc-badge">{svcInitial}</span>}
            </div>
            {custName    && <div className="tb-sc-customer">{custName}</div>}
            {serviceType && <div className="tb-sc-service">{serviceType}</div>}
          </div>

          <div className="tb-sc-footer">
            {timeLeft && <span className="tb-sc-time">{timeLeft}</span>}
            <div className="tb-sc-progress-wrap">
              <svg className="tb-sc-svg" viewBox="0 0 26 26">
                <circle className="tb-sc-svg-bg" cx="13" cy="13" r="11" />
                <circle className="tb-sc-svg-fill ct-tc-svg-fill" cx="13" cy="13" r="11" />
              </svg>
              <span className="tb-sc-progress-text">{progress}%</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

CTTaskCard.propTypes = {
  card:            PropTypes.object.isRequired,
  index:           PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isSelected:      PropTypes.bool,
  onToggleSelect:  PropTypes.func,
  isSelectionMode: PropTypes.bool,
};
